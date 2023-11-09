import axios from "axios";

export async function search(name, type, accessToken) {
    const query = `${type}:${name}`
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=50&offset=50`;

    console.log(url)

    try {
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
            return response.data; 
    } catch (error) {
        console.error('Error al realizar la solicitud:', error.message);
    }
}

