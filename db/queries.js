const pool = require("./pool");

async function getAllCategories() {
    const categories = await pool.query("SELECT name FROM category");
    return categories;
  }
  
async function createCategory(name, description) {
    await pool.query("INSERT INTO category (name, description) VALUES ($1, $2)", [name, description]);
  }

async function getCategory(id) {
    const category = await pool.query("SELECT * FROM category WHERE id=$1", [id]);
    return category;
}

async function deleteCategory(id) {
    await pool.query("DELETE FROM category WHERE id=$1", [id]);
}

async function updateCategory(id, name, description) {
    await pool.query("UPDATE category SET name=$1, description=$2 WHERE id=$3", [name, description, id]);
}

async function countItems() {
    const item_count = await pool.query("SELECT COUNT(*) FROM item");
    return item_count;
}

async function countCategories() {
    const category_count = await pool.query("SELECT COUNT(*) FROM category");
    return category_count;
}

async function getAllItems() {
    const items = await pool.query("SELECT name FROM category");
    return items;
}

async function getItem(id) {
    const item = await pool.query("SELECT * FROM item WHERE id = $1", [id]);
    return item;
}

async function deleteItem(id) {
    await pool.query("DELETE FROM item WHERE id = $1", [id]);
}

async function updateItem(id, name, image, description, category_id, price, number_in_stock) {
    await pool.query("UPDATE item SET name=$1, image=$2, description=$3, category_id=$4, price=$5, number_in_stock=$6 WHERE id=$7",
        [name, image, description, category_id, price, number_in_stock, id]
    );
}
  
  module.exports = {
    getAllCategories,
    createCategory,
    getCategory,
    deleteCategory,
    updateCategory,
    countItems,
    countCategories,
    getAllItems,
    getItem,
    deleteItem,
    updateItem
  };

