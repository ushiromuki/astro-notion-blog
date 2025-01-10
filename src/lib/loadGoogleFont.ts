export const loadGoogleFont = async (text: string) => {
    const API = `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&text=${text}`;

    const css = await (
        await fetch(API, {
            headers: {
                // Make sure it returns TTF.
                "User-Agent":
                    "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
            },
        })
    ).text();

    const resource = css.match(
        /src: url\((.+)\) format\('(opentype|truetype)'\)/
    );

    if (!resource) return;

    const res = await fetch(resource[1]);

    return res;
};

// 参考　https://blog.sus-happy.net/astrojs-ssr/