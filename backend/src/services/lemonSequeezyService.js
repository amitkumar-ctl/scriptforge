const LEMONSQUEEZY_API_KEY  = process.env.LEMONSQUEEZY_API_KEY;
const LEMONSQUEEZY_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID;
const MONTHLY_VARIANT_ID    = process.env.LEMONSQUEEZY_MONTHLY_VARIANT_ID;
const YEARLY_VARIANT_ID     = process.env.LEMONSQUEEZY_YEARLY_VARIANT_ID;

const LS_BASE = 'https://api.lemonsqueezy.com/v1';

function lsHeaders() {
  return {
    'Accept':        'application/vnd.api+json',
    'Content-Type':  'application/vnd.api+json',
    'Authorization': `Bearer ${LEMONSQUEEZY_API_KEY}`,
  };
}

async function createCheckout({ variantId, userId, email, name, successUrl }) {
  const body = {
    data: {
      type: 'checkouts',
      attributes: {
        checkout_data: {
          email,
          name,
          custom: { user_id: userId },
        },
        checkout_options: {
          embed:        false,
          media:        true,
          logo:         true,
          desc:         true,
          discount:     true,
          button_color: '#63dca3',
        },
        product_options: {
          redirect_url:           successUrl,
          receipt_link_url:       successUrl,
          receipt_thank_you_note: 'Thank you for subscribing to ScriptForge Pro! 🎉',
        },
        expires_at: null,
      },
      relationships: {
        store:   { data: { type: 'stores',   id: String(LEMONSQUEEZY_STORE_ID) } },
        variant: { data: { type: 'variants', id: String(variantId) } },
      },
    },
  };

  const res = await fetch(`${LS_BASE}/checkouts`, {
    method:  'POST',
    headers: lsHeaders(),
    body:    JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LemonSqueezy checkout failed: ${err}`);
  }

  const data = await res.json();
  return data.data.attributes.url;
}

async function cancelSubscription(lsSubscriptionId) {
  const res = await fetch(`${LS_BASE}/subscriptions/${lsSubscriptionId}`, {
    method:  'DELETE',
    headers: lsHeaders(),
  });
  if (!res.ok) throw new Error('Failed to cancel subscription');
  return res.ok;
}

function getVariantId(period) {
  return period === 'yearly' ? YEARLY_VARIANT_ID : MONTHLY_VARIANT_ID;
}

module.exports = { createCheckout, cancelSubscription, getVariantId };