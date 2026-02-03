import Customer from '../models/Customer';
import * as factory from '../utils/controllerFactory';

export const getAllCustomers = factory.getAll(Customer);
export const getCustomer = factory.getOne(Customer);
export const createCustomer = factory.createOne(Customer);
export const updateCustomer = factory.updateOne(Customer);
export const deleteCustomer = factory.deleteOne(Customer);
