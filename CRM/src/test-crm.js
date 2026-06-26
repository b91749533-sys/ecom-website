const http = require('http');

const STOREFRONT_URL = 'http://localhost:3000';
const CRM_URL = 'http://localhost:3001';

// Helper to make request
function makeRequest(url, method, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const options = {
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data ? JSON.parse(data) : null
        });
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== STARTING CRM SYNCHRONIZATION BRIDGE TESTS ===');
  
  const testEmail = `clara.vance.${Date.now()}@gmail.com`;
  let cookieHeader = '';

  // 1. Test Customer Registration Sync
  console.log(`\n1. Registering customer: ${testEmail}...`);
  const regRes = await makeRequest(`${STOREFRONT_URL}/api/auth`, 'POST', {}, {
    action: 'register',
    name: 'Clara Vance',
    email: testEmail,
    password: 'password123'
  });

  if (regRes.statusCode !== 200 || !regRes.body.success) {
    console.error('Registration failed:', regRes.body);
    process.exit(1);
  }
  console.log('Customer registered successfully on Storefront.');
  
  // Capture session cookie
  const setCookie = regRes.headers['set-cookie'];
  if (setCookie) {
    cookieHeader = setCookie.map(c => c.split(';')[0]).join('; ');
  }

  // 2. Test Storefront Cart Item Add
  console.log('\n2. Adding item to storefront cart...');
  // Dior Sauvage EDP id (slug: dior-sauvage-edp). We can find its ID by listing products.
  const productsRes = await makeRequest(`${STOREFRONT_URL}/api/products`, 'GET');
  const sauvage = productsRes.body.data.products.find(p => p.slug === 'dior-sauvage-edp');
  if (!sauvage) {
    console.error('Could not find Sauvage product');
    process.exit(1);
  }

  const addCartRes = await makeRequest(`${STOREFRONT_URL}/api/cart/items`, 'POST', {
    'Cookie': cookieHeader
  }, {
    productId: sauvage.id,
    quantity: 2
  });

  if (addCartRes.statusCode !== 200 || !addCartRes.body.success) {
    console.error('Add to cart failed:', addCartRes.body);
    process.exit(1);
  }
  console.log('Product added to storefront cart.');

  // 3. Test Cart Sync to CRM
  console.log('\n3. Triggering Cart Sync to CRM...');
  const syncCartRes = await makeRequest(`${STOREFRONT_URL}/api/crm/track-cart`, 'POST', {
    'Cookie': cookieHeader
  });
  if (syncCartRes.statusCode !== 200 || !syncCartRes.body.success) {
    console.error('Cart sync trigger failed:', syncCartRes.body);
    process.exit(1);
  }
  console.log('Cart sync request successfully dispatched to CRM. Session ID:', syncCartRes.body.sessionId);

  // 4. Test Browsing History (Activity) Sync to CRM
  console.log('\n4. Triggering Activity Sync to CRM...');
  const syncActivityRes = await makeRequest(`${STOREFRONT_URL}/api/crm/track-activity`, 'POST', {
    'Cookie': cookieHeader
  }, {
    page: `/product/${sauvage.slug}`,
    duration: 75,
    device: 'Desktop',
    browser: 'Chrome'
  });
  if (syncActivityRes.statusCode !== 200 || !syncActivityRes.body.success) {
    console.error('Activity sync failed:', syncActivityRes.body);
    process.exit(1);
  }
  console.log('Activity sync request successfully dispatched to CRM.');

  // 5. Test Checkout and Order Sync to CRM
  console.log('\n5. Performing Checkout on storefront...');
  const checkoutRes = await makeRequest(`${STOREFRONT_URL}/api/orders`, 'POST', {
    'Cookie': cookieHeader
  }, {
    email: testEmail,
    name: 'Clara Vance',
    address: '123 Pine Street',
    city: 'Boston',
    state: 'MA',
    zip: '02108',
    country: 'US'
  });

  if (checkoutRes.statusCode !== 200 || !checkoutRes.body.success) {
    console.error('Checkout failed:', checkoutRes.body);
    process.exit(1);
  }
  const orderNumber = checkoutRes.body.data.order.orderNumber;
  console.log(`Checkout success! Order created: ${orderNumber}`);

  // Wait a moment for async sync calls to finish
  console.log('\nWaiting 2 seconds for CRM databases to settle...');
  await new Promise(r => setTimeout(r, 2000));

  // 6. Log in to CRM Admin to verify entries
  console.log('\n6. Logging in to CRM as Admin...');
  const crmLoginRes = await makeRequest(`${CRM_URL}/api/auth/login`, 'POST', {}, {
    email: 'admin@lumiere-crm.com',
    password: 'admin123'
  });

  if (crmLoginRes.statusCode !== 200 || !crmLoginRes.body.success) {
    console.error('CRM Login failed:', crmLoginRes.body);
    process.exit(1);
  }
  console.log('Logged in to CRM. User:', crmLoginRes.body.user.name);
  const crmCookie = crmLoginRes.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');

  // 7. Verify sync data in CRM
  console.log('\n7. Verifying Customer record in CRM...');
  const crmCustomersRes = await makeRequest(`${CRM_URL}/api/customers`, 'GET', {
    'Cookie': crmCookie
  });
  const crmCustomer = crmCustomersRes.body.customers.find(c => c.email === testEmail);
  if (!crmCustomer) {
    console.error(`Customer ${testEmail} was NOT found in CRM!`);
    process.exit(1);
  }
  console.log(`Customer record verified in CRM. Name: ${crmCustomer.name}, Status: ${crmCustomer.status}, Total Spent: $${crmCustomer.totalSpent}`);

  console.log('\n8. Verifying Order record in CRM...');
  const crmOrdersRes = await makeRequest(`${CRM_URL}/api/orders`, 'GET', {
    'Cookie': crmCookie
  });
  const crmOrder = crmOrdersRes.body.orders.find(o => o.orderNumber === orderNumber);
  if (!crmOrder) {
    console.error(`Order ${orderNumber} was NOT found in CRM!`);
    process.exit(1);
  }
  console.log(`Order record verified in CRM. Number: ${crmOrder.orderNumber}, Status: ${crmOrder.status}, Total: $${crmOrder.total}`);

  // 8. Test RBAC Rules
  console.log('\n9. Logging in as Support to test Role-Based Access Control (RBAC)...');
  const supportLoginRes = await makeRequest(`${CRM_URL}/api/auth/login`, 'POST', {}, {
    email: 'support@lumiere-crm.com',
    password: 'support123'
  });
  if (supportLoginRes.statusCode !== 200) {
    console.error('Support login failed');
    process.exit(1);
  }
  const supportCookie = supportLoginRes.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');

  // Try to access settings panel via api
  console.log('Support user requesting restricted Admin Settings API...');
  const settingsRes = await makeRequest(`${CRM_URL}/api/settings/staff`, 'GET', {
    'Cookie': supportCookie
  });
  console.log(`Restricted Settings API response status: ${settingsRes.statusCode} (Expected: 403)`);
  if (settingsRes.statusCode !== 403) {
    console.error('RBAC Failure: Support was allowed to access staff settings!');
    process.exit(1);
  }
  console.log('RBAC verified. Support user successfully blocked.');

  console.log('\n=== ALL SYNCHRONIZATION AND RBAC TESTS PASSED SUCCESSFULLY! ===');
}

runTests().catch(console.error);
