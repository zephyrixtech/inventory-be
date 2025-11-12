import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { Category } from '../models/category.model';
import { ApiError } from '../utils/api-error';
import { asyncHandler } from '../utils/async-handler';
import { respond } from '../utils/api-response';

export const listCategories = asyncHandler(async (req: Request, res: Response) => {
  const companyId = req.companyId;
  if (!companyId) {
    throw ApiError.badRequest('Company context missing');
  }

  const categories = await Category.find({ company: companyId, isActive: true }).sort({ name: 1 });

  return respond(res, StatusCodes.OK, categories);
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const companyId = req.companyId;
  if (!companyId) {
    throw ApiError.badRequest('Company context missing');
  }

  const { name, description } = req.body;

  const existing = await Category.findOne({ company: companyId, name });
  if (existing) {
    throw ApiError.conflict('Category with this name already exists');
  }

  const category = await Category.create({
    company: companyId,
    name,
    description
  });

  return respond(res, StatusCodes.CREATED, category, { message: 'Category created successfully' });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const companyId = req.companyId;
  if (!companyId) {
    throw ApiError.badRequest('Company context missing');
  }

  const category = await Category.findOne({ _id: req.params.id, company: companyId });

  if (!category) {
    throw ApiError.notFound('Category not found');
  }

  const { name, description, isActive } = req.body;

  if (name) category.name = name;
  if (description) category.description = description;
  if (typeof isActive === 'boolean') category.isActive = isActive;

  await category.save();

  return respond(res, StatusCodes.OK, category, { message: 'Category updated successfully' });
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const companyId = req.companyId;
  if (!companyId) {
    throw ApiError.badRequest('Company context missing');
  }

  const category = await Category.findOne({ _id: req.params.id, company: companyId });

  if (!category) {
    throw ApiError.notFound('Category not found');
  }

  category.isActive = false;
  await category.save();

  return respond(res, StatusCodes.OK, { success: true }, { message: 'Category deactivated successfully' });
});

