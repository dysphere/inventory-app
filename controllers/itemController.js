const Item = require("../models/item");
const Category = require("../models/category");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
  cloud_name: 'djwajeqeu', 
  api_key: '132935884388799', 
  api_secret: 'By9oU7B8YIicf-mHHrm1MXL2Irs',
});

// Utility function to upload image to Cloudinary
async function uploadToCloudinary(filePath) {
  if (!filePath) return null;
  try {
    const result = await cloudinary.uploader.upload(filePath);
    return result.url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return null;
  }
}

exports.index = asyncHandler(async (req, res, next) => {
    // Get details of category and item counts
    const [
      numCategories,
      numItems,
    ] = await Promise.all([
      Category.countDocuments({}).exec(),
      Item.countDocuments({}).exec(),
    ]);
  
    res.render("index", {
      title: "Inventory Home",
      item_count: numItems,
      category_count: numCategories,
    });
  });

// Display list of all items.
exports.item_list = asyncHandler(async (req, res, next) => {
  const allItems = await Item.find({}, "name category")
    .sort({ name: 1 })
    .populate("category")
    .exec();

  res.render("item_list", { title: "Item List", item_list: allItems });
});

// Display detail page for a specific item.
exports.item_detail = asyncHandler(async (req, res, next) => {
  // Get details of item
  const item = await Item.findById(req.params.id).populate("category").exec();

  if (item === null) {
    // No results.
    const err = new Error("Item not found");
    err.status = 404;
    return next(err);
  }

  res.render("item_detail", {
    title: "Item Detail",
    item: item,

  });
});

// Display item create form on GET.
exports.item_create_get = asyncHandler(async (req, res, next) => {
  // Get all items and categories
  const allCategories = await Category.find().sort({ name: 1 }).exec();

  res.render("item_form", {
    title: "Create Item",
    categories: allCategories,
  });
});

// Handle item create on POST.
exports.item_create_post = [

  // Convert the category to an array.
  (req, res, next) => {
    if (!Array.isArray(req.body.category)) {
      req.body.category =
        typeof req.body.category === "undefined" ? [] : [req.body.category];
    }
    next();
  },

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
  body("category.*").escape(),

  async (req, res, next) => {
    const errors = validationResult(req);

    const allCategories = await Category.find().sort({ name: 1 }).exec();

    // In case there are validation errors or not, you always need to check categories
    // Mark our selected categories as checked. It's important this is done after fetching categories
    for (let category of allCategories) {
      category._doc.checked = req.body.category.includes(category._id.toString());
    }

    if (!errors.isEmpty()) {
      // If there are errors, render the form again with error messages
      return res.render("item_form", {
        title: "Create Item",
        categories: allCategories,
        item: req.body, // Pass the previously entered values back to the form
        errors: errors.array(),
      });
    }

    try {
      // Handle file upload and item creation...
      const imageUrl = req.file ? await uploadToCloudinary(req.file.path) : null;
      const item = new Item({
        name: req.body.name,
        description: req.body.description,
        price: parseFloat(req.body.price),
        numberInStock: parseInt(req.body.numberInStock, 10),
        category: req.body.category,
        ...(imageUrl && { image: imageUrl })
      });
      
      await item.save();
      return res.redirect(item.url);
    } catch (error) {
      next(error);
    }
  }

];

// Display item delete form on GET.
exports.item_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of item and 
  const item = await Item.findById(req.params.id).exec();

  if (item === null) {
    // No results.
    res.redirect("/inventory/items");
  }

  res.render("item_delete", {
    title: "Delete Item",
    item: item,
  });
});

// Handle item delete on POST.
exports.item_delete_post = asyncHandler(async (req, res, next) => {
  
    // Delete item
    await Item.findByIdAndDelete(req.body.itemid);
    res.redirect("/inventory/items");
  }
);

// Display item update form on GET.
exports.item_update_get = asyncHandler(async (req, res, next) => {
  // Get item and categories for form.
  const [item, allCategories] = await Promise.all([
    Item.findById(req.params.id).populate("category").exec(),
    Category.find().sort({ name: 1 }).exec(),
  ]);

  if (item === null) {
    // No results.
    const err = new Error("Item not found");
    err.status = 404;
    return next(err);
  }

  const itemCategories = item.category.map(cat => cat._id.toString());
  allCategories.forEach(cat => {
    // Mark category as checked if it's one of the item's categories
    cat.checked = itemCategories.includes(cat._id.toString());
  });
  
  res.render("item_form", {
    title: "Update Item",
    categories: allCategories,
    item: item,
  });
});

exports.item_update_post = [
  // Convert the category to an array.
  (req, res, next) => {
    if (!Array.isArray(req.body.category)) {
      req.body.category = typeof req.body.category === "undefined" ? [] : [req.body.category];
    }
    next();
  },

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
  body("category.*").escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const imageUrl = req.file ? await uploadToCloudinary(req.file.path) : undefined;

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
      const allCategories = await Category.find().sort({ name: 1 }).exec();

      // This is required before you mark categories as checked.
      const itemCategoryIds = itemUpdateData.category.map(cat => cat.toString());

      allCategories.forEach(category => {
        category.checked = itemCategoryIds.includes(category._id.toString());
      });

      return res.render("item_form", {
        title: "Update Item",
        categories: allCategories,
        item: itemUpdateData,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Update the record.
      const updatedItem = await Item.findByIdAndUpdate(req.params.id, itemUpdateData, { new: true });

      // Redirect to the updated item detail page.
      res.redirect(updatedItem.url);
    }
  }),
];

