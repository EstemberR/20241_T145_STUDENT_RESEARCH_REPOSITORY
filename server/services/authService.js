import GoogleAuth from 'google-auth-library';

async function getAccessToken() {
  const auth = new google.auth.GoogleAuth({
    keyFile: './Assets/GDrive.json',
    scopes: ['https://www.googleapis.com/auth/drive.file'], // Drive API scopes
  });
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  return accessToken;
}
export default getAccessToken;
