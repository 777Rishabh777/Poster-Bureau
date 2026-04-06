from flask import Flask, request, jsonify
from flask_cors import CORS
import re

app = Flask(__name__)
CORS(app)

CATEGORY_RULES = {
    "Anime": [
        "anime", "manga", "naruto", "one piece", "gear 5", "demon slayer", "tanjiro", "nezuko",
        "rengoku", "solo leveling", "gojo", "sukuna", "hashira", "goku", "zoro", "akaza"
    ],
    "Gaming": [
        "gaming", "gamer", "elden", "halo", "minecraft", "playstation", "xbox", "arcade",
        "controller", "boss fight", "battle royale", "rpg", "fps"
    ],
    "Marvel": [
        "marvel", "iron man", "stark", "thor", "captain america", "spider-man", "avengers",
        "arc reactor", "black panther", "doctor strange"
    ],
    "Auto": [
        "auto", "car", "drift", "porsche", "lamborghini", "ferrari", "supra", "gt-r", "gtr",
        "street racer", "garage", "track", "rally", "engine"
    ],
}

STYLE_HINTS = {
    "Anime": ["Cinematic", "Collector Series", "Wall Statement", "High Contrast"],
    "Gaming": ["Neon Energy", "Esports Room", "Boss Fight Mood", "RGB Ready"],
    "Marvel": ["Heroic", "Studio Finish", "Collector Edition", "Impact Frame"],
    "Auto": ["Street Culture", "Track Day", "Blueprint Mood", "Motion Detail"],
    "Posters": ["Gallery Grade", "Premium Print", "Collector Wall", "Modern Setup"],
    "General": ["Gallery Grade", "Premium Print", "Collector Wall", "Modern Setup"],
}

PRESENTATION_HINTS = {
    "Anime": {"swiper_effect": "creative", "three_scene": "energy-orbs"},
    "Gaming": {"swiper_effect": "coverflow", "three_scene": "grid-particles"},
    "Marvel": {"swiper_effect": "cards", "three_scene": "arc-reactor-glow"},
    "Auto": {"swiper_effect": "cards", "three_scene": "light-tunnel"},
    "Posters": {"swiper_effect": "coverflow", "three_scene": "particle-field"},
    "General": {"swiper_effect": "coverflow", "three_scene": "particle-field"},
}


def compact_spaces(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def slug_tokens(value: str):
    cleaned = re.sub(r"[^a-zA-Z0-9\s-]", " ", value or "")
    return [token for token in cleaned.lower().split() if token]


def dedupe(items):
    seen = set()
    output = []
    for item in items:
        normalized = compact_spaces(str(item))
        key = normalized.lower()
        if not normalized or key in seen:
            continue
        seen.add(key)
        output.append(normalized)
    return output


def detect_category(title: str, explicit_category: str = "") -> str:
    if explicit_category and explicit_category not in ("General", "Posters"):
        return explicit_category

    haystack = f"{title} {explicit_category}".lower()
    for category, keywords in CATEGORY_RULES.items():
        if any(keyword in haystack for keyword in keywords):
            return category

    return explicit_category or "Posters"


def build_tags(title: str, category: str, existing_tags):
    tokens = slug_tokens(title)
    base_tags = {
        "Anime": ["Anime Art", "Collector Print", "Premium Wall Art", "High Contrast", "Otaku Room"],
        "Gaming": ["Gaming Setup", "Collector Print", "Room Upgrade", "Neon Mood", "Battle Station"],
        "Marvel": ["Marvel Art", "Hero Poster", "Collector Print", "Studio Finish", "Fan Display"],
        "Auto": ["Auto Culture", "Garage Wall", "Performance Art", "Speed Detail", "Collector Print"],
        "Posters": ["Gallery Print", "Premium Decor", "Collector Print", "Room Upgrade", "Wall Statement"],
        "General": ["Gallery Print", "Premium Decor", "Collector Print", "Room Upgrade", "Wall Statement"],
    }
    style_tags = STYLE_HINTS.get(category, STYLE_HINTS["General"])
    title_tags = []
    if tokens:
        title_tags.append(tokens[0].title())
    if len(tokens) > 1:
        title_tags.append(f"{tokens[0].title()} {tokens[1].title()}")

    return dedupe(list(existing_tags or []) + base_tags.get(category, []) + style_tags + title_tags)[:8]


def build_description(title: str, category: str, tags):
    mood_map = {
        "Anime": "anime collectors who want motion, contrast, and character-led energy on the wall",
        "Gaming": "gaming rooms that need a sharper focal point and late-night setup energy",
        "Marvel": "hero-themed spaces that need a premium studio-finish centerpiece",
        "Auto": "garage builds, desk setups, and speed-driven interiors with a motorsport edge",
        "Posters": "modern rooms that need a premium print with gallery-grade presence",
        "General": "modern rooms that need a premium print with gallery-grade presence",
    }
    feature_line = ", ".join(tags[:3]) if tags else "gallery-grade detail"
    return (
        f"{title} is a premium {category.lower()} print built for {mood_map.get(category, mood_map['General'])}. "
        f"The composition leans into {feature_line.lower()} so it reads clean from a distance and still feels rich up close. "
        f"Use it as a hero piece above a desk, bed, or collector wall where bold color and crisp detail matter."
    )


def build_seo_title(title: str, category: str) -> str:
    return compact_spaces(f"{title} | Premium {category} Poster | The Poster Bureau")[:70]


def build_seo_description(title: str, category: str, tags):
    keyword_line = ", ".join(tags[:4]) if tags else "premium wall art"
    return compact_spaces(
        f"Shop {title}, a premium {category.lower()} poster from The Poster Bureau. Discover {keyword_line.lower()} and collector-grade wall art for standout setups."
    )[:155]


def build_hero_badge(category: str, tags):
    if tags:
        return tags[0]
    return STYLE_HINTS.get(category, STYLE_HINTS["General"])[0]


def build_style_notes(category: str, title: str):
    notes = {
        "Anime": "Use layered gradients, sharper crop transitions, and expressive coverflow motion.",
        "Gaming": "Lean into directional lighting, stronger hover states, and a denser particle field.",
        "Marvel": "Use metallic highlights, stronger depth shadows, and slower dramatic transitions.",
        "Auto": "Use motion blur cues, sleek specular highlights, and horizontal card movement.",
        "Posters": "Keep the surface premium and let the artwork carry the hierarchy.",
        "General": "Keep the surface premium and let the artwork carry the hierarchy.",
    }
    if re.search(r"limited|collector|edition", title, re.IGNORECASE):
        return notes.get(category, notes["General"]) + " Treat this as a collector-led SKU in product cards."
    return notes.get(category, notes["General"])


@app.get('/ai/health')
def ai_health():
    return jsonify({
        "ok": True,
        "service": "poster-bureau-ai",
        "version": "2.0",
        "capabilities": [
            "category_suggestion",
            "tag_generation",
            "description_generation",
            "seo_copy",
            "presentation_hints"
        ]
    })


@app.route('/ai/generate-tags', methods=['POST'])
def generate_tags():
    data = request.json or {}
    title = compact_spaces(data.get('title', 'Untitled Poster'))
    category = detect_category(title, compact_spaces(data.get('category', '')))
    existing_tags = data.get('tags', [])
    if isinstance(existing_tags, str):
        existing_tags = [part.strip() for part in existing_tags.split(',') if part.strip()]

    suggested_tags = build_tags(title, category, existing_tags)
    description = build_description(title, category, suggested_tags)
    presentation = PRESENTATION_HINTS.get(category, PRESENTATION_HINTS['General'])

    return jsonify({
        "suggested_category": category,
        "suggested_tags": suggested_tags,
        "ai_description": description,
        "seo_title": build_seo_title(title, category),
        "seo_description": build_seo_description(title, category, suggested_tags),
        "hero_badge": build_hero_badge(category, suggested_tags),
        "style_notes": build_style_notes(category, title),
        "presentation_hint": presentation,
        "confidence": 0.84 if category != 'Posters' else 0.72,
    })


if __name__ == '__main__':
    app.run(port=8000, debug=True)
