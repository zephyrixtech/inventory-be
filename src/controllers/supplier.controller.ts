import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { Supplier } from '../models/supplier.model';
import { ApiError } from '../utils/api-error';
import { asyncHandler } from '../utils/async-handler';
import { respond } from '../utils/api-response';
import { getPaginationParams } from '../utils/pagination';
import { buildPaginationMeta } from '../utils/query-builder';

export const listSuppliers = asyncHandler(async (req: Request, res: Response) => {
  const companyId = req.companyId;
  if (!companyId) {
    throw ApiError.badRequest('Company context missing');
  }

  const { status, contact, search } = req.query;
  const { page, limit, sortBy, sortOrder } = getPaginationParams(req);

  const filters: Record<string, unknown> = {
    company: companyId
  };

  if (status && status !== 'all') {
    filters.status = status;
  }

  if (contact && typeof contact === 'string') {
    filters.contactPerson = contact;
  }

  if (search && typeof search === 'string') {
    filters.$or = [
      { name: new RegExp(search, 'i') },
      { supplierId: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') }
    ];
  }

  const query = Supplier.find(filters).populate('createdBy', 'firstName lastName email');

  if (sortBy) {
    query.sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 });
  } else {
    query.sort({ createdAt: -1 });
  }

  query.skip((page - 1) * limit).limit(limit);

  const [suppliers, total] = await Promise.all([query.exec(), Supplier.countDocuments(filters)]);

  return respond(res, StatusCodes.OK, suppliers, buildPaginationMeta(page, limit, total));
});

export const getSupplier = asyncHandler(async (req: Request, res: Response) => {
  const companyId = req.companyId;
  if (!companyId) {
    throw ApiError.badRequest('Company context missing');
  }

  const supplier = await Supplier.findOne({ _id: req.params.id, company: companyId });

  if (!supplier) {
    throw ApiError.notFound('Supplier not found');
  }

  return respond(res, StatusCodes.OK, supplier);
});

export const createSupplier = asyncHandler(async (req: Request, res: Response) => {
  const companyId = req.companyId;
  if (!companyId) {
    throw ApiError.badRequest('Company context missing');
  }

  const { supplierId, name, email, phone, contactPerson, status, address, creditReport } = req.body;

  const existing = await Supplier.findOne({ company: companyId, supplierId });
  if (existing) {
    throw ApiError.conflict('Supplier with this ID already exists');
  }

  const supplier = await Supplier.create({
    company: companyId,
    supplierId,
    name,
    email,
    phone,
    contactPerson,
    status,
    address,
    creditReport,
    createdBy: req.user?.id
  });

  return respond(res, StatusCodes.CREATED, supplier, { message: 'Supplier created successfully' });
});

export const updateSupplier = asyncHandler(async (req: Request, res: Response) => {
  const companyId = req.companyId;
  if (!companyId) {
    throw ApiError.badRequest('Company context missing');
  }

  const supplier = await Supplier.findOne({ _id: req.params.id, company: companyId });

  if (!supplier) {
    throw ApiError.notFound('Supplier not found');
  }

  const { name, email, phone, contactPerson, status, address, creditReport, isActive } = req.body;

  if (name) supplier.name = name;
  if (email) supplier.email = email;
  if (phone) supplier.phone = phone;
  if (contactPerson) supplier.contactPerson = contactPerson;
  if (status) supplier.status = status;
  if (typeof isActive === 'boolean') supplier.isActive = isActive;
  if (address) supplier.address = address;
  if (creditReport) supplier.creditReport = creditReport;

  await supplier.save();

  return respond(res, StatusCodes.OK, supplier, { message: 'Supplier updated successfully' });
});

export const deleteSupplier = asyncHandler(async (req: Request, res: Response) => {
  const companyId = req.companyId;
  if (!companyId) {
    throw ApiError.badRequest('Company context missing');
  }

  const supplier = await Supplier.findOne({ _id: req.params.id, company: companyId });

  if (!supplier) {
    throw ApiError.notFound('Supplier not found');
  }

  supplier.isActive = false;
  supplier.status = 'rejected';
  await supplier.save();

  return respond(res, StatusCodes.OK, { success: true }, { message: 'Supplier deactivated successfully' });
});

