import { Request, Response } from "express";
import Project, { IProject } from "../models/Project";
import User from "../models/User";

export const createProject = async (req: Request, res: Response) => {
  try {
    const { name, description, language } = req.body;
    const project = new Project({
      name,
      description,
      language,
      owner: req.userId,
    });
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: "Error creating project", error });
  }
};

export const getProject = async (req: Request, res: Response) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [{ owner: req.userId }, { collaborators: req.userId }],
    });
    if (!project)
      return res
        .status(404)
        .json({ message: "Project not found or you don't have access" });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Error fetching project", error });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const { name, description, content, language } = req.body;
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      { name, description, content, language, updatedAt: Date.now() },
      { new: true }
    );
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Error updating project", error });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      owner: req.userId,
    });
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting project", error });
  }
};

export const getProjects = async (req: Request, res: Response) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.userId }, { collaborators: req.userId }],
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Error fetching projects", error });
  }
};

export const addCollaborator = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      { $addToSet: { collaborators: user._id } },
      { new: true }
    );

    if (!project) {
      return res
        .status(404)
        .json({ message: "Project not found or you're not the owner" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Error adding collaborator", error });
  }
};
