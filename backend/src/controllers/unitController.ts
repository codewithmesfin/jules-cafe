import Unit from '../models/Unit';
import UnitConversion from '../models/UnitConversion';
import * as factory from '../utils/controllerFactory';

export const getAllUnits = factory.getAll(Unit);
export const getUnit = factory.getOne(Unit);
export const createUnit = factory.createOne(Unit);
export const updateUnit = factory.updateOne(Unit);
export const deleteUnit = factory.deleteOne(Unit);

export const getAllConversions = factory.getAll(UnitConversion);
export const getConversion = factory.getOne(UnitConversion);
export const createConversion = factory.createOne(UnitConversion);
export const updateConversion = factory.updateOne(UnitConversion);
export const deleteConversion = factory.deleteOne(UnitConversion);
