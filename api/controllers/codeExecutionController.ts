import { Request, Response } from "express";
import { VM } from "vm2";

export const executeCode = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    console.log("Received code to execute:", code);

    if (!code || typeof code !== "string") {
      return res.status(400).json({ message: "Invalid code provided" });
    }

    let output = "";
    const vm = new VM({
      timeout: 1000,
      sandbox: {
        console: {
          log: (...args: any[]) => {
            output += args.map((arg) => String(arg)).join(" ") + "\n";
          },
        },
      },
    });

    const result = vm.run(code);
    console.log("Execution result:", result);
    console.log("Console output:", output);

    res.json({
      result: result !== undefined ? String(result) : undefined,
      consoleOutput: output.trim(),
    });
  } catch (error) {
    console.error("Error executing code:", error);
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: "Error executing code", error: error.message });
    } else {
      res
        .status(500)
        .json({ message: "Unknown error occurred while executing code" });
    }
  }
};
