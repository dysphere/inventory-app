const pool = require("./pool");

async function getAllCategories() {
    const {categories} = await pool.query("SELECT name FROM category");
    return categories;
  }
  
async function createCategory(name, description) {
    await pool.query("INSERT INTO category (name, description) VALUES ($1, $2)", [name, description]);
  }

async function getCategoryByName(name) {
    const category = await pool.query("SELECT id FROM category WHERE name=$1", [name]);
    return category.rows[0];
}

async function getCategory(id) {
    const category = await pool.query("SELECT * FROM category WHERE id=$1", [id]);
    return category.rows[0];
}

async function deleteCategory(id) {
    await pool.query("DELETE FROM category WHERE id=$1", [id]);
}

async function updateCategory(id, name, description) {
    await pool.query("UPDATE category SET name=$1, description=$2 WHERE id=$3", [name, description, id]);
}

async function countItems() {
    const item_count = await pool.query("SELECT COUNT(*) AS count FROM item");
    return item_count.rows[0].count;
}

async function countCategories() {
    const category_count = await pool.query("SELECT COUNT(*) AS count FROM category");
    return category_count.rows[0].count;
}

async function createItem(name, image, description, category_id, price, number_in_stock) {
    await pool.query("INSERT INTO item (name, image, description, category_id, price, number_in_stock) VALUES ($1, $2, $3, $4, $5, $6)",
        [name, image, description, category_id, price, number_in_stock]
    );
}

async function getAllItems() {
    const {items} = await pool.query("SELECT name FROM category");
    return items;
}

async function getCategoryItems(category_id) {
    const items = await pool.query("SELECT * FROM category WHERE category_id=$1", [category_id]);
    return items.rows[0];
}

async function getItem(id) {
    const item = await pool.query("SELECT * FROM item WHERE id = $1", [id]);
    return item.rows[0];
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
    getCategoryByName,
    getCategory,
    deleteCategory,
    updateCategory,
    countItems,
    countCategories,
    createItem,
    getAllItems,
    getCategoryItems,
    getItem,
    deleteItem,
    updateItem
  };

