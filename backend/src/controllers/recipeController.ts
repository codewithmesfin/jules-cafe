import Recipe from '../models/Recipe';
import * as factory from '../utils/controllerFactory';

export const getAllRecipes = factory.getAll(Recipe);
export const getRecipe = factory.getOne(Recipe);
export const createRecipe = factory.createOne(Recipe);
export const updateRecipe = factory.updateOne(Recipe);
export const deleteRecipe = factory.deleteOne(Recipe);
