const { createClient } = require('@supabase/supabase-js');
const cron = require('node-cron');
const moment = require('moment-timezone');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyInitialCredits() {
  console.log("Applying 50 credits to all users...");

  const { data: users, error } = await supabase
    .from('profiles')
    .select('*');

  if (error) {
    console.log(error);
    return;
  }

  for (const user of users) {
    if (!user.credits || user.credits < 50) {
      await supabase
        .from('profiles')
        .update({ credits: 50 })
        .eq('id', user.id);

      console.log(`Updated ${user.id}`);
    }
  }
}

async function refillDailyCredits() {
  console.log("Running daily refill...");

  const { data: users, error } = await supabase
    .from('profiles')
    .select('*');

  if (error) {
    console.log(error);
    return;
  }

  for (const user of users) {
    await supabase
      .from('profiles')
      .update({ credits: 20 })
      .eq('id', user.id);
  }

  console.log("Daily refill complete.");
}

applyInitialCredits();

cron.schedule('0 0 * * *', () => {
  const now = moment().tz("Africa/Lagos").format();
  console.log(`Midnight refill running: ${now}`);
  refillDailyCredits();
});
