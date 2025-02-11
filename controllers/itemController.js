const db = require("../db/queries");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.index = asyncHandler(async (req, res, next) => {
    // Get details of category and item counts
    const [
      numCategories,
      numItems,
    ] = await Promise.all([
      db.countCategories(),
      db.countItems(),
    ]);
  
    res.render("index", {
      title: "Inventory Home",
      item_count: numItems,
      category_count: numCategories,
    });
  });

// Display list of all items.
exports.item_list = asyncHandler(async (req, res, next) => {
  const allItems = await db.getAllItems();

  res.render("item_list", { title: "Item List", item_list: allItems });
});

// Display detail page for a specific item.
exports.item_detail = asyncHandler(async (req, res, next) => {
  // Get details of item
  const item = await db.getItem(req.params.id);
  const category = await db.getCategoryOfItem(item.name);

  res.render("item_detail", {
    title: "Item Detail",
    item: item,
    category: category,
  });
});

// Display item create form on GET.
exports.item_create_get = asyncHandler(async (req, res, next) => {
  // Get all items and categories
  const allCategories = await db.getAllCategories();

  res.render("item_form", {
    title: "Create Item",
    categories: allCategories,
  });
});

const validateItem = [
  // Validate and sanitize fields.
  body("name", "Name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("description", "Description must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("price", "Price must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .isNumeric({ no_symbols: false })
    .escape(),
  body("numberInStock", "There must be a number in stock.")
    .trim()
    .isLength({ min: 1 })
    .isNumeric({ no_symbols: true })
    .escape(),
]

// Handle item create on POST.
exports.item_create_post = [

  validateItem,

  async (req, res, next) => {
    const errors = validationResult(req);

    const allCategories = await db.getAllCategories();

    if (!errors.isEmpty()) {
      // If there are errors, render the form again with error messages
      return res.render("item_form", {
        title: "Create Item",
        categories: allCategories,
        errors: errors.array(),
      });
    }

     // Handle item creation...
    const { name, description, category, price, numberInStock } = req.body;
    const price_float = parseFloat(price);
    const numberInStock_int = parseInt(numberInStock);
    await db.createItem(name, description, category, price_float, numberInStock_int);
    const item_id = await db.getItemByName(name);
    res.redirect(`/inventory/item/${item_id}`);
  }

];

// Handle item delete on POST.
exports.item_delete_post = asyncHandler(async (req, res, next) => {
  await db.deleteItem(req.params.id);
  res.redirect("/inventory/items");
  }
);

// Display item update form on GET.
exports.item_update_get = asyncHandler(async (req, res, next) => {
  // Get item and categories for form.
  const [item, allCategories] = await Promise.all([
    db.getItem(req.params.id),
    db.getAllCategories(),
  ]);

  res.render("item_update", {
    title: "Update Item",
    categories: allCategories,
    item: item,
  });
});

exports.item_update_post = [

  // Validate and sanitize fields.
  validateItem,

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const allCategories = await db.getAllCategories();

    // Create a Item object with escaped/trimmed data and old id.
    const itemUpdateData = {
      name: req.body.name,
      description: req.body.description,
      price: parseFloat(req.body.price),
      numberInStock: parseInt(req.body.numberInStock, 10),
      category: typeof req.body.category === "undefined" ? [] : req.body.category,
      ...(imageUrl && { image: imageUrl })
    };

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      return res.render("item_form", {
        title: "Update Item",
        categories: allCategories,
        item: itemUpdateData,
        errors: errors.array(),
      });
    } else {
      if (req.body.password === "correcthorsebatterystaple") {
        // Data from form is valid. Update the record.
        const itemCategory = await db.getCategoryByName(req.body.category);
        const updatedItem = await db.updateItem(req.params.id, req.body.name, imageUrl, req.body.description, itemCategory, parseFloat(req.body.price), parseInt(req.body.numberInStock), req.params.id);

        // Redirect to the updated item detail page.
        res.redirect(`/inventory/item/${req.params.id}`);
      }
      else {
        res.render("item_form", {
          title: "Update Item",
          categories: allCategories,
          item: itemUpdateData,
          errors: errors.array(),
          invalid_password: true,
        });
      }
    }
  }),
];

