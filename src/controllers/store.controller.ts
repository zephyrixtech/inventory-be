import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { Store } from '../models/store.model';
import { User } from '../models/user.model';
import { ApiError } from '../utils/api-error';
import { asyncHandler } from '../utils/async-handler';
import { respond } from '../utils/api-response';

export const listStores = asyncHandler(async (req: Request, res: Response) => {
  const companyId = req.companyId;
  if (!companyId) {
    throw ApiError.badRequest('Company context missing');
  }

  const stores = await Store.find({ company: companyId, isActive: true })
    .populate('manager', 'firstName lastName email')
    .sort({ name: 1 });

  return respond(res, StatusCodes.OK, stores);
});

export const createStore = asyncHandler(async (req: Request, res: Response) => {
  const companyId = req.companyId;
  if (!companyId) {
    throw ApiError.badRequest('Company context missing');
  }

  const { name, code, managerId, phone, email, address } = req.body;

  const existing = await Store.findOne({ company: companyId, code });
  if (existing) {
    throw ApiError.conflict('Store with this code already exists');
  }

  let manager = null;
  if (managerId) {
    manager = await User.findOne({ _id: managerId, company: companyId });
    if (!manager) {
      throw ApiError.badRequest('Invalid store manager');
    }
  }

  const store = await Store.create({
    company: companyId,
    name,
    code,
    manager: manager?._id,
    phone,
    email,
    address
  });

  return respond(res, StatusCodes.CREATED, store, { message: 'Store created successfully' });
});

export const updateStore = asyncHandler(async (req: Request, res: Response) => {
  const companyId = req.companyId;
  if (!companyId) {
    throw ApiError.badRequest('Company context missing');
  }

  const store = await Store.findOne({ _id: req.params.id, company: companyId });

  if (!store) {
    throw ApiError.notFound('Store not found');
  }

  const { name, managerId, phone, email, address, isActive } = req.body;

  if (name) store.name = name;
  if (phone) store.phone = phone;
  if (email) store.email = email;
  if (address) store.address = address;
  if (typeof isActive === 'boolean') store.isActive = isActive;

  if (managerId) {
    const manager = await User.findOne({ _id: managerId, company: companyId });
    if (!manager) {
      throw ApiError.badRequest('Invalid store manager');
    }
    store.manager = manager._id;
  }

  await store.save();

  return respond(res, StatusCodes.OK, store, { message: 'Store updated successfully' });
});

export const deleteStore = asyncHandler(async (req: Request, res: Response) => {
  const companyId = req.companyId;
  if (!companyId) {
    throw ApiError.badRequest('Company context missing');
  }

  const store = await Store.findOne({ _id: req.params.id, company: companyId });

  if (!store) {
    throw ApiError.notFound('Store not found');
  }

  store.isActive = false;
  await store.save();

  return respond(res, StatusCodes.OK, { success: true }, { message: 'Store deactivated successfully' });
});

