import { getRequest } from "../config/apiCaller";
import { apiPath } from "../config/apiPath";

export const categoryService = {
    getCategories: async (userId, successCallback, errorCallback) => {
        console.log("Fetching categories for user:", userId);
        return await getRequest(
            apiPath.getAllCategory,
            { userId }, 
            successCallback,
            errorCallback
        );
    },
}