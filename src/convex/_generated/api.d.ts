/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as http from "../http.js";
import type * as ml_catalog from "../ml/catalog.js";
import type * as ml_inference from "../ml/inference.js";
import type * as ml_randomForest from "../ml/randomForest.js";
import type * as ml_types from "../ml/types.js";
import type * as ml_model from "../ml_model.js";
import type * as modelInfo from "../modelInfo.js";
import type * as predict from "../predict.js";
import type * as symptoms from "../symptoms.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  "auth/emailOtp": typeof auth_emailOtp;
  http: typeof http;
  "ml/catalog": typeof ml_catalog;
  "ml/inference": typeof ml_inference;
  "ml/randomForest": typeof ml_randomForest;
  "ml/types": typeof ml_types;
  ml_model: typeof ml_model;
  modelInfo: typeof modelInfo;
  predict: typeof predict;
  symptoms: typeof symptoms;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
