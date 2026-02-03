import Menu from '../models/Menu';
import * as factory from '../utils/controllerFactory';

export const getAllMenu = factory.getAll(Menu, { populate: 'product_id' });
export const getMenu = factory.getOne(Menu, { populate: 'product_id' });
export const createMenu = factory.createOne(Menu);
export const updateMenu = factory.updateOne(Menu);
export const deleteMenu = factory.deleteOne(Menu);
