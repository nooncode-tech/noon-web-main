async function test() {
  try {
    const res = await fetch('https://umqbtqbsfjgfhdptbqfb.supabase.co/rest/v1/', {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtcWJ0cWJzZmpnZmhkcHRicWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NjkyMTQsImV4cCI6MjA2NzA0NTIxNH0.57yImPpv8osj9Up8KJv6vv4bGaRx4aJeSZtGrNvK4UE'
      }
    });
    console.log('Status:', res.status, res.statusText);
    const text = await res.text();
    console.log('Body:', text.substring(0, 200));
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}
test();
