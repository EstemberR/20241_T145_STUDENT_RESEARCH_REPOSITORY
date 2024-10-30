import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

try {
    //hiding the API info
    const serviceAccount = {
  "type": "service_account",
  "project_id": "student-research-repository",
  "private_key_id": "b8ca9ee8c4d6ee2cd2f59ca3ae1651bf8f3735ea",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQC8+s193jWCyGob\n3QWkE4YbrWjVtTjprHx809I5UB7PZW3sIfJvZGPf1YDPn87vPPqtNm+kRuqgg7Eo\nS7WG22tqJHtJ/d8xa0gtDwg7g81eP0yuKmfdP1OJunAz/qheYweTbprCjenpreDq\nPfbbxwMlWT6twUMRq4drI/MTZHPb+SNDf5fT+O33ShL6q7CtznFQ0ipQxQwdqFiw\nvk+cxH4E7c47kV6kzlsb7EIYZw2SETle2tLCb8zrmRDzpM40ProMJ/sT78DRKoYc\nQlPs0euu4PWBT+MkpNbQQGLjrGru0W1ax5ZQmI9bC+OLzHddlk3AqbYBavKKJ6Ac\ncqsIQ+Z/AgMBAAECggEAIeYrbmSp3KfuwMjI9kG6UMSuhYdYijIysoGcuEMzA6kC\nKtV8E5dCgyhdTuEv0aJypReatzExbVGyObQ6/9HkVsnsg71SiB7id5K2u1ZNRJa+\nPo/Eyd9OMOqMrgcEVMoW1c+FW1jxmMVkDyDGY24zlkOIBssgKM9IH2P3eocOcWrU\nb/TW2LQhUBY8ene9pYVlJ9MA/3z+HJDhfT6vy/RlfIgwsnZIYKLX0h1Psulabtdr\nVgNWWvoXTq7hraXaHhnr01QvriVF6lIc2P3M7a6/oxr/zjhR45hdq1r5Kbz5gVk0\nL3Y/FQNN0vyYyT0/57p45ECsPwRBWngO/S267FsXIQKBgQDntQp6WIzz4uYDkWye\nb/hSHBJ3tToWu/DHHalyhAKp9aJ4U+H3ZxVgZjsaooM2ZfjcoboE7hnsIX058DCN\naHBm5HHAxlXWgVxeInm4W+t+ANKR6NZmUT+kZDonsA6VMzcuWwCYn1Au5B+SjDfi\nB+xJn3IXzQykvF1JEnuOIFiNPQKBgQDQyvefq3BJxod/2P8iVBGkn59dMOIzzTnV\nCMF7ZSS/ZVElEZrI6KN0X7H8VsVTHh486hpZqzZiNbjhoPL+xZ7l5h81z125isY/\nbSOtWLmKeJqQVzsIBUHOFW2zN1DDkIOQxpV102AugPl5X/Xw8nzLoHFbfUOOBxMK\nXC0djq42awKBgQCRx6zU9vuPwlT3L7rIICh6+KCB4mquvQYrMLVYkEfgyOO0kwob\njya65PcQteiaBCREJBiWW3vBvfw8xKq3fVsi0V3kbKS69d64dzZf0K1kNH5HQNgL\nvditxEV2jOVP584zAxxn6ewX5H0cxc2vD08RrxiocuEekEic3d0Qubcc/QKBgQC0\nGc/9f/FNAh4Rbsms/910JmheB3OngWhYVcQnv3gyTJ/xHL1qfhm4oW8zHln5t2oX\n20u9e01e6749igrxLuBAqP7U+Ll8+bLGNUtoFLd/NUcGKOh3o6k+rgdBZv6YosiK\nEnIL/7fghUoso1TPcSuqrgv6AhRKp9mJvzb/XvrxXwKBgQDmQBJFymAcERjzSRaE\n4DutJ7abfRQI4OhyWvuYsKDFw2WPNQomKrX09GXzjKibSVL/4FAiT0NtB10XzwIP\nC08LtCzkkzmrPn46F/43QEa9xfZ9gIbdZCWrEozWahwlLiSpGVTWAnwLFEUabfk4\nc8noEks7H9amgnS1HXzm7UcYQw==\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-8jy3f@student-research-repository.iam.gserviceaccount.com",
  "client_id": "105162056559806166247",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-8jy3f%40student-research-repository.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        // Other configuration if necessary
    });
} catch (error) {
    console.error('Error parsing Firebase service account:', error);
}
export default admin;