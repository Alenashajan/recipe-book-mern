const express = require('express');
const mongoose = require('mongoose');
const Recipe = require('../models/Recipe');

const router = express.Router();

function normalizeList(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === 'string') return value.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
  return [];
}

function validatePayload(body) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const category = typeof body.category === 'string' ? body.category : '';
  const ingredients = normalizeList(body.ingredients);
  const steps = normalizeList(body.steps);
  const cookingTime = Number(body.cookingTime);
  const categories = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Other'];

  if (!name) return { error: 'Recipe name is required.' };
  if (name.length > 100) return { error: 'Recipe name must be 100 characters or fewer.' };
  if (!categories.includes(category)) return { error: 'Choose a valid category.' };
  if (!ingredients.length) return { error: 'Enter at least one ingredient.' };
  if (!steps.length) return { error: 'Enter at least one preparation step.' };
  if (!Number.isInteger(cookingTime) || cookingTime < 1 || cookingTime > 1440) {
    return { error: 'Cooking time must be a whole number from 1 to 1440 minutes.' };
  }
  return { data: { name, category, ingredients, steps, cookingTime } };
}

router.get('/', async (req, res, next) => {
  try {
    const recipes = await Recipe.find().sort({ createdAt: -1 });
    res.json(recipes);
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid recipe ID.' });
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found.' });
    res.json(recipe);
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const result = validatePayload(req.body);
    if (result.error) return res.status(400).json({ message: result.error });
    const recipe = await Recipe.create(result.data);
    res.status(201).json({ message: 'Recipe added successfully!', recipe });
  } catch (error) { next(error); }
});

router.put('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid recipe ID.' });
    const result = validatePayload(req.body);
    if (result.error) return res.status(400).json({ message: result.error });
    const recipe = await Recipe.findByIdAndUpdate(req.params.id, result.data, {
      new: true, runValidators: true
    });
    if (!recipe) return res.status(404).json({ message: 'Recipe not found.' });
    res.json({ message: 'Recipe updated successfully!', recipe });
  } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid recipe ID.' });
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found.' });
    res.json({ message: 'Recipe deleted successfully.' });
  } catch (error) { next(error); }
});

module.exports = router;
