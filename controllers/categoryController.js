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

// Handle category create on POST.
exports.category_create_post = [
  // Validate and sanitize fields
  body("name")
    .trim()
    .isLength({ min: 1, max: 100 }),
  body("description")
    .trim()
    .isLength({ min: 1, max: 100 }),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("category_form", {
        title: "Create Category",
        category: category,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if category with same name already exists.
      const categoryExists = await db.getCategoryByName(req.body.name);
      if (categoryExists) {
        // Genre exists, redirect to its detail page.
        res.redirect(`/inventory/category/${categoryExists}`)
      } else {
        const category = await db.createCategory(req.body.name, req.body.description);
        // New category saved. Redirect to category detail page.
        res.redirect(`/inventory/category/${categoryExists}`)
      }
    }
  }),
];

// Display category delete form on GET.
exports.category_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of category and all items in it
  const [category, allItemsInCategory] = await Promise.all([
    db.getCategory(req.params.id),
    db.getCategoryItems(req.params.id),
  ]);

  if (category === null) {
    // No results.
    res.redirect("/inventory/categories");
  }

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

  if (category === null) {
    // No results.
    const err = new Error("Category not found");
    err.status = 404;
    return next(err);
  }

  res.render("category_form", {
    title: "Update Category",
    category: category,
  });
});

// Handle category update on POST.
exports.category_update_post = [

  // Validate and sanitize fields.
  body("name")
    .trim()
    .isLength({ min: 1, max: 100 }),
  body("description")
    .trim()
    .isLength({ min: 1, max: 100 }),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      res.render("category_form", {
        title: "Update Category",
        category: category,
        errors: errors.array(),
      });
      return;
    } else {
      if (req.body.password === "correcthorsebatterystaple") {
      // Data from form is valid. Update the record.
      await db.updateCategory(req.params.id, req.body.name, req.body.description);
      // Redirect to book detail page.
      res.redirect(`/inventory/category/${req.params.id}`)
      }
      else {
        res.render("admin_confirm");
      }
    }
  }),
];
