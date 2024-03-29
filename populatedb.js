#! /usr/bin/env node
  
  // Get arguments passed on command line
  const userArgs = process.argv.slice(2);
  
  const Item = require("./models/item");
  const Category = require("./models/category");
  
  const items = [];
  const categories = [];
  
  const mongoose = require("mongoose");
  mongoose.set("strictQuery", false);
  
  const mongoDB = userArgs[0];
  
  main().catch((err) => console.log(err));
  
  async function main() {
    console.log("Debug: About to connect");
    await mongoose.connect(mongoDB);
    console.log("Debug: Should be connected?");
    await createCategories();
    await createItems();
    console.log("Debug: Closing mongoose");
    mongoose.connection.close();
  }
  
  async function itemCreate(index, name, description, price, numberInStock, category) {
    const itemdetail = {
      name: name,
      description: description,
      price: price,
      numberInStock: numberInStock,
    };
    if (category != false) itemdetail.category = category;
  
    const item = new Item(itemdetail);
    await item.save();
    items[index] = item;
    console.log(`Added item: ${name}`);
  }
  
  async function categoryCreate(index, name, description) {
    const categorydetail = {
      name: name,
      description: description,
    };
  
    const category = new Category(categorydetail);
    await category.save();
    categories[index] = category;
    console.log(`Added category: ${name}`);
  }
  
  async function createCategories() {
    console.log("Adding categories");
    await Promise.all([
      categoryCreate(0, "Produce", "Fresh fruits and vegetables"),
      categoryCreate(1, "Dairy", "Milk based products"),
      categoryCreate(2, "Bakery", "Fresh baked goods"),
    ]);
  }
  
  async function createItems() {
    console.log("Adding items");
    await Promise.all([
      itemCreate(0, "Milk", "Pasteurized milk fresh from the cow",  10.99, 8, [categories[1]]),
      itemCreate(1, "Tomato", "Ripe, juicy tomatoes", 4.99, 20, [categories[0]]),
      itemCreate(2, "Banana bread", "Freshly baked quickbread", 7, 10, [categories[2]]),
      itemCreate(3, "Celery", "Crisp celery", 3, 15, [categories[0]]),
      itemCreate(4, "Garlic bread", "Aromatic garlic bread with lots of butter", 15, 6, [categories[2]]),
    ]);
  }
