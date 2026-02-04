import Table from '../models/Table';
import * as factory from '../utils/controllerFactory';

export const getAllTables = factory.getAll(Table);
export const getTable = factory.getOne(Table);
export const createTable = factory.createOne(Table);
export const updateTable = factory.updateOne(Table);
export const deleteTable = factory.deleteOne(Table);
