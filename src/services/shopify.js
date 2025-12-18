import { shopifyApi, ApiVersion, Session } from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node';
import dotenv from 'dotenv';
dotenv.config();
const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: ['read_orders'],
  hostName: 'localhost',
  apiVersion: ApiVersion.October24,
  isEmbeddedApp: false,
});
const session = new Session({
  id: 'offline_session',
  shop: process.env.SHOPIFY_SHOP_DOMAIN,
  state: 'custom_app_state',
  isOnline: false,
  accessToken: process.env.SHOPIFY_ACCESS_TOKEN,
});
const getClient = () => new shopify.clients.Graphql({ session });
export const fetchUnpaidOrders = async (cursor = null) => {
  const query = `
    query ($cursor: String) {
      orders(first: 50, after: $cursor, query: "status:open AND payment_status:pending") {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
            name
            email
            statusPageUrl
            currentSubtotalPriceSet { shopMoney { amount } }
            customer {
              firstName
              metafield(namespace: "custom", key: "stopreminder") {
                value
              }
            }
            
            # Fetch Payment Terms to calculate due date
            paymentTerms {
              paymentSchedules(first: 1) {
                nodes { dueAt }
              }
            }
          }
        }
      }
    }
  `;
  const client = getClient();
  const response = await client.request(query, {
    variables: { cursor },
  });
  return response.data.orders;
};