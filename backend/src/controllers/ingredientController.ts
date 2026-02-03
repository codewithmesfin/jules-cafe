import Ingredient from '../models/Ingredient';
import * as factory from '../utils/controllerFactory';

export const getAllIngredients = factory.getAll(Ingredient);
export const getIngredient = factory.getOne(Ingredient);
export const createIngredient = factory.createOne(Ingredient);
export const updateIngredient = factory.updateOne(Ingredient);
export const deleteIngredient = factory.deleteOne(Ingredient);
