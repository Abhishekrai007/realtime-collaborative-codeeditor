import { Request, Response, NextFunction } from "express";
import { VM } from "vm2";
import { exec } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as util from "util";
import Docker from "dockerode";

const docker = new Docker();
const writeFileAsync = util.promisify(fs.writeFile);
const mkdirAsync = util.promisify(fs.mkdir);
const rmAsync = util.promisify(fs.rm);

const execPromise = util.promisify(exec);

const TIMEOUT = 5000; // 5 seconds timeout for code execution
const MAX_BUFFER = 1024 * 1024; // 1 MB output buffer

interface ExecutionResult {
  result: string;
  consoleOutput: string;
}

async function executeJavaScript(code: string): Promise<ExecutionResult> {
  let output = "";
  const vm = new VM({
    timeout: TIMEOUT,
    sandbox: {
      console: {
        log: (...args: any[]) => {
          output += args.map((arg) => String(arg)).join(" ") + "\n";
        },
      },
    },
  });

  const result = vm.run(code);
  return {
    result: result !== undefined ? String(result) : "undefined",
    consoleOutput: output.trim(),
  };
}

async function executePython(code: string): Promise<ExecutionResult> {
  const tempFile = path.join(__dirname, `temp_${Date.now()}.py`);
  await fs.promises.writeFile(tempFile, code);

  try {
    const { stdout, stderr } = await execPromise(`python ${tempFile}`, {
      timeout: TIMEOUT,
      maxBuffer: MAX_BUFFER,
    });
    return { result: stdout.trim(), consoleOutput: stderr.trim() };
  } finally {
    await fs.promises.unlink(tempFile);
  }
}

async function executeJava(code: string): Promise<ExecutionResult> {
  const className = extractClassName(code) || "Main";
  const tempDir = path.join(__dirname, `temp_${Date.now()}`);
  await fs.promises.mkdir(tempDir);
  const tempFile = path.join(tempDir, `${className}.java`);
  await fs.promises.writeFile(tempFile, code);

  try {
    console.log(`Compiling Java file: ${tempFile}`);
    const compileResult = await execPromise(`javac ${tempFile}`, {
      timeout: TIMEOUT,
      maxBuffer: MAX_BUFFER,
    });
    console.log("Compilation result:", compileResult);

    console.log(`Executing Java class: ${className}`);
    const { stdout, stderr } = await execPromise(
      `java -cp ${tempDir} ${className}`,
      {
        timeout: TIMEOUT,
        maxBuffer: MAX_BUFFER,
      }
    );
    console.log("Execution stdout:", stdout);
    console.log("Execution stderr:", stderr);
    return { result: stdout.trim(), consoleOutput: stderr.trim() };
  } catch (error) {
    console.error("Error executing Java code:", error);
    throw error;
  } finally {
    await fs.promises.rm(tempDir, { recursive: true, force: true });
  }
}

async function executeC(code: string): Promise<ExecutionResult> {
  const tempDir = path.join(__dirname, `temp_${Date.now()}`);
  await fs.promises.mkdir(tempDir);
  const tempFile = path.join(tempDir, "main.c");
  const outputFile = path.join(tempDir, "a.out");
  await fs.promises.writeFile(tempFile, code);

  try {
    await execPromise(`gcc ${tempFile} -o ${outputFile}`, {
      timeout: TIMEOUT,
      maxBuffer: MAX_BUFFER,
    });
    const { stdout, stderr } = await execPromise(outputFile, {
      timeout: TIMEOUT,
      maxBuffer: MAX_BUFFER,
    });
    return { result: stdout.trim(), consoleOutput: stderr.trim() };
  } finally {
    await fs.promises.rm(tempDir, { recursive: true, force: true });
  }
}

async function executeCpp(code: string): Promise<ExecutionResult> {
  const tempDir = path.join(__dirname, `temp_${Date.now()}`);
  await fs.promises.mkdir(tempDir);
  const tempFile = path.join(tempDir, "main.cpp");
  const outputFile = path.join(tempDir, "a.out");
  await fs.promises.writeFile(tempFile, code);

  try {
    await execPromise(`g++ ${tempFile} -o ${outputFile}`, {
      timeout: TIMEOUT,
      maxBuffer: MAX_BUFFER,
    });
    const { stdout, stderr } = await execPromise(outputFile, {
      timeout: TIMEOUT,
      maxBuffer: MAX_BUFFER,
    });
    return { result: stdout.trim(), consoleOutput: stderr.trim() };
  } finally {
    await fs.promises.rm(tempDir, { recursive: true, force: true });
  }
}

function extractClassName(code: string): string | null {
  const match = code.match(/public\s+class\s+(\w+)/);
  return match ? match[1] : null;
}

async function checkLanguageSupport(language: string): Promise<boolean> {
  try {
    switch (language) {
      case "python":
        await execPromise("python --version");
        break;
      case "java":
        await execPromise("javac -version");
        break;
      case "c":
        await execPromise("gcc --version");
        break;
      case "cpp":
        await execPromise("g++ --version");
        break;
      default:
        return true; // JavaScript is always supported
    }
    return true;
  } catch (error) {
    return false;
  }
}

export const executeCode = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { code, language } = req.body;
    console.log("Received request body:", req.body);
    console.log(`Received ${language} code to execute:`, code);

    if (!code || typeof code !== "string" || !language) {
      console.log("Invalid input:", { code, language });
      res.status(400).json({ message: "Invalid code or language provided" });
      return;
    }

    const isSupported = await checkLanguageSupport(language);
    if (!isSupported) {
      res
        .status(400)
        .json({ message: `${language} is not supported on this system` });
      return;
    }

    let result: ExecutionResult;

    switch (language.toLowerCase()) {
      case "javascript":
        result = await executeJavaScript(code);
        break;
      case "python":
        result = await executePython(code);
        break;
      case "java":
        result = await executeJava(code);
        break;
      case "c":
        result = await executeC(code);
        break;
      case "cpp":
        result = await executeCpp(code);
        break;
      default:
        res.status(400).json({ message: "Unsupported language" });
        return;
    }

    console.log("Execution result:", result);

    res.json(result);
  } catch (error) {
    console.error("Error executing code:", error);
    res.status(500).json({
      message: "Error executing code",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};
