import { useState, useEffect } from 'react';

const API_KEY = '9d5c39ce06ad4cc9b0fa86a0c427df94';

export const NewsApi = (category,search) => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const getData = async () => {
            try {
                if (category === 'home') {
                    category = null
                }
                console.log(category)
                let url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${API_KEY}`;
                if (category) {
                    url += `&category=${category}`;
                }
                if (search) {
                    url += `&q=${search}`;
                }
                const response = await fetch(url
                );
                console.log('Fetching news from:', url);

                
                const data = await response.json();
                setNews(data.articles || []);
            } catch (error) {
                setNews([])
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        getData();
    }, [category,search]);

    return { news, loading };
};
