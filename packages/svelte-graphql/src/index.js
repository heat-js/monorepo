
export { Query } from "./query.js"
export { Mutation } from "./mutation.js"
export { GraphQLError } from './graphql-error.js';
export { STORE_FIRST, CACHE_FIRST, CACHE_AND_NETWORK, NETWORK_ONLY, NO_CACHE } from "./policy/query.js"
export { CACHE_ONLY, STORE_ONLY, CACHE_AND_STORE } from "./policy/modify.js"
export { getCache, initCache, getClient, initClient, register, getStores } from "./global.js"
