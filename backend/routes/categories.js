/**
 * 分类管理路由
 * 功能：处理分类的CRUD操作，支持树形结构和扁平结构的分类获取
 */
const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const { adminAuth } = require("../middleware/auth");

/**
 * 获取所有分类（树形结构）
 * @route GET /api/categories
 * @returns {array} 分类树形结构
 */
router.get("/", async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [
        {
          model: Category,
          as: "children",
          include: [
            {
              model: Category,
              as: "children",
            },
          ],
        },
      ],
      where: {
        parent_id: null,
      },
      order: [
        ["level", "ASC"],
        ["id", "ASC"],
      ],
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "获取分类失败", error: error.message });
  }
});

/**
 * 获取所有分类（扁平结构）
 * @route GET /api/categories/flat
 * @returns {array} 分类扁平列表
 */
router.get("/flat", async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [
        ["level", "ASC"],
        ["id", "ASC"],
      ],
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "获取分类失败", error: error.message });
  }
});

/**
 * 创建分类 (仅管理员)
 * @route POST /api/categories
 * @param {string} name - 分类名称
 * @param {string} description - 分类描述
 * @param {number} parent_id - 父分类ID
 * @returns {object} 创建的分类
 */
router.post("/", adminAuth, async (req, res) => {
  const { name, description, parent_id } = req.body;
  try {
    let level = 0;

    // 如果有父分类，计算层级
    if (parent_id) {
      const parentCategory = await Category.findByPk(parent_id);
      if (!parentCategory) {
        return res.status(400).json({ message: "父分类不存在" });
      }
      level = parentCategory.level + 1;
    }

    const category = await Category.create({
      name,
      description,
      parent_id,
      level,
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: "创建分类失败", error: error.message });
  }
});

/**
 * 更新分类 (仅管理员)
 * @route PUT /api/categories/:id
 * @param {number} id - 分类ID
 * @param {string} name - 分类名称
 * @param {string} description - 分类描述
 * @param {number} parent_id - 父分类ID
 * @returns {object} 更新后的分类
 */
router.put("/:id", adminAuth, async (req, res) => {
  const { name, description, parent_id } = req.body;
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "分类不存在" });
    }

    // 检查是否会造成循环引用
    if (parent_id && parent_id === parseInt(req.params.id)) {
      return res.status(400).json({ message: "分类不能作为自己的父分类" });
    }

    let level = 0;

    // 如果有父分类，计算层级
    if (parent_id) {
      const parentCategory = await Category.findByPk(parent_id);
      if (!parentCategory) {
        return res.status(400).json({ message: "父分类不存在" });
      }
      level = parentCategory.level + 1;
    }

    await category.update({
      name,
      description,
      parent_id,
      level,
    });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: "更新分类失败", error: error.message });
  }
});

/**
 * 删除分类 (仅管理员)
 * @route DELETE /api/categories/:id
 * @param {number} id - 分类ID
 * @returns {object} 操作结果
 */
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "分类不存在" });
    }

    // 将子分类的父分类设置为null
    await Category.update(
      { parent_id: null, level: 0 },
      { where: { parent_id: req.params.id } },
    );

    await category.destroy();
    res.json({ message: "分类删除成功" });
  } catch (error) {
    res.status(500).json({ message: "删除分类失败", error: error.message });
  }
});

// 导出路由
module.exports = router;
