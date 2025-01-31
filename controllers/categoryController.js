const db = require("../db/queries");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display list of all categories.
exports.category_list = asyncHandler(async (req, res, next) => {
  const allCategories = await db.getAllCategories();
  res.render("category_list", { title: "Category List", category_list: allCategories });
});

// Display detail page for a specific category.
exports.category_detail = asyncHandler(async (req, res, next) => {
  // Get details of category and all items in it
  const [category, allItemsInCategory] = await Promise.all([
    db.getCategory(req.params.id),
    db.getCategoryItems(req.params.id),
  ]);

  if (category === null) {
    // No results.
    const err = new Error("Category not found");
    err.status = 404;
    return next(err);
  }
console.log(category, allItemsInCategory);
  res.render("category_detail", {
    title: "Category Detail",
    category: category,
    category_items: allItemsInCategory,
  });
});

// Display category create form on GET.
exports.category_create_get = (req, res, next) => {
  res.render("category_form", { title: "Create Category" });
};

const lengthErr = "must be between 1 and 100 characters.";

const validateCategory = [
  body("name")
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage(`Name ${lengthErr}`),
  body("description")
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage(`Description ${lengthErr}`),
];

// Handle category create on POST.
exports.category_create_post = [
  // Validate and sanitize fields
  validateCategory,
// Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
     // There are errors. Render the form again with sanitized values/error messages.
    if (!errors.isEmpty()) {
      return res.status(400).render("category_form", {
        title: "Create category",
        errors: errors.array(),
      });
    }
    const { name, description } = req.body;
    await db.createCategory(name, description);
    const category_id = await db.getCategoryByName(name);
    res.redirect(`/inventory/category/${category_id}`);
  })
];

// Display category delete form on GET.
exports.category_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of category and all items in it
  const [category, allItemsInCategory] = await Promise.all([
    db.getCategory(req.params.id),
    db.getCategoryItems(req.params.id),
  ]);

  res.render("category_delete", {
    title: "Delete Category",
    category: category,
    category_items: allItemsInCategory,
  });
});

// Handle category delete on POST.
exports.category_delete_post = asyncHandler(async (req, res, next) => {
  // Get details of category and all items in it
  const [category, allItemsInCategory] = await Promise.all([
    db.getCategory(req.params.id),
    db.getCategoryItems(req.params.id),
  ]);

  if (allItemsInCategory.length > 0) {
    // Category has items. Render in same way as for GET route.
    res.render("category_delete", {
      title: "Delete Category",
      category: category,
      category_items: allItemsInCategory,
    });
    return;
  } else {
    if (req.body.password === "correcthorsebatterystaple") {
    // Category has no items. Delete object and redirect to the list of categories.
      await db.deleteItem(req.body.categoryid);
      res.redirect("/inventory/categories");
    }
    else {
      res.render("admin_confirm")
    }
  }
});

// Display category update form on GET.
exports.category_update_get = asyncHandler(async (req, res, next) => {
  // Get category for form.
  const category = await db.getCategory(req.params.id);

  res.render("category_form", {
    title: "Update Category",
    category: category,
  });
});

// Handle category update on POST.
exports.category_update_post = [

  validateCategory,

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    const category = await db.getCategory(req.params.id);
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      res.status(400).render("category_form", {
        title: "Update Category",
        category: category,
        errors: errors.array(),
      });
    } 

    const { name, description } = req.body;
    await db.updateCategory(req.params.id, name, description);
    res.redirect(`/inventory/category/${req.params.id}`)
  }),
];
