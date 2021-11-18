import common from '../core/message/common.msg.js'
import mongoose from 'mongoose';


const CategorySchema = mongoose.Schema({

    category: { type: String, default: "" },
    desc: { type: String, default: "" },
    path: { type: String, default: "" },
    enabled: { type: String, default: "true", enum: ["true", "false"] }, //true-enabled, false-disabled
    deleted: { type: String, default: "false", enum: ["true", "false"] },  //false-not delete, true-deleted 

}, { timestamps: true, collection: 'category' });

let CategoryModel = mongoose.model('category', CategorySchema);

CategoryModel.addCategory = (categoryToAdd) => {
    return categoryToAdd.save();
}

CategoryModel.findCategory = (categoryToFind) => {
    //return CategoryModel.find(categoryToFind.query,categoryToFind.projection).lean();

    let page = common.pageLimit * Math.max(0, categoryToFind.page);
    return CategoryModel.aggregate(
        [
            { $match: categoryToFind.query },
            {
                $lookup:
                {
                    from: "tools",
                    localField: "_id",
                    foreignField: "categoryId",
                    as: "tool_docs"
                }
            },
            {
                $project: {
                    orderId: 1,
                    category: 1,
                    categoryId: 1,
                    status: 1,
                    trash: 1,
                    desc: 1,
                    fileName: 1,
                    path: 1,
                    createAt: 1,
                    updatedAt: 1,
                    toolCount: { $size: "$tool_docs" }
                }
            }
        ]
    ).skip(page).limit(common.pageLimit).sort({ "orderId": 1 });
}


CategoryModel.getCategoryList = () => {
    return CategoryModel.find().sort({ "orderId": 1 });
}

CategoryModel.editCategory = (categoryToEdit) => {
    return CategoryModel.update(categoryToEdit.query, categoryToEdit.data);
}


CategoryModel.getSearchCategory = (whereData) => {
    return CategoryModel.find(whereData.query, { category: 1 });
}


CategoryModel.getOneCategoryData = (whereData) => {
    return CategoryModel.findOne(whereData);
}

CategoryModel.getCategoryArrData = (whereData) => {
    return CategoryModel.find(whereData);
}

CategoryModel.getCategoryCount = () => {
    return CategoryModel.find().count();
}

CategoryModel.getCategoryListDataAdmin = (whereData) => {
    return CategoryModel.find(whereData).sort({ "orderId": 1 }).lean();
}


CategoryModel.updateCategoryOrderId = (updateData) => {
    return CategoryModel.update(updateData.query, updateData.data);
}

CategoryModel.removeData = (where) => {
    return CategoryModel.remove(where);
}


CategoryModel.getCategoryData = (where, page, limit) => {
    return CategoryModel.find(where).sort({ 'orderId': 1 }).skip(page * limit).limit(limit);
}


CategoryModel.getCategoryTradeData = (type) => {

    let sortObj = { 'orderId': 1 };

    if (type == 1) {
        sortObj = { 'electricalOrderId': 1 };
    }

    if (type == 2) {
        sortObj = { 'concreteOrderId': 1 };
    }
    return CategoryModel.find({ trash: "false" }).sort(sortObj);
}


export default CategoryModel;
