#!/usr/bin/env python3
"""Generate tiny preloaded UI WOFF2 subsets and disjoint unicode-ranges for HarmonyOS Sans SC."""

from __future__ import annotations

import json
import pathlib
from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont

DRIVE_ROOT = pathlib.Path(__file__).resolve().parent.parent
WEB_DIR = DRIVE_ROOT / "src" / "web"
AUTH_SDK = DRIVE_ROOT.parent / "手语分社账号" / "src" / "web" / "sdk.js"

EXTRA_UI_TEXT = (
    "手语分社以手予爱心创云盘统一通行证未登录已开通权限刚刚今天昨天年月日时分秒"
    "，。、；：？！“”‘’（）【】《》「」『』—…·～￥％＋－＊／＝＜＞"
)


def to_unicode_range(codepoints: set[int]) -> str:
    if not codepoints:
        return ""
    pts = sorted(codepoints)
    ranges: list[str] = []
    start = prev = pts[0]
    for cp in pts[1:]:
        if cp == prev + 1:
            prev = cp
        else:
            ranges.append(f"U+{start:X}" if start == prev else f"U+{start:X}-{prev:X}")
            start = prev = cp
    ranges.append(f"U+{start:X}" if start == prev else f"U+{start:X}-{prev:X}")
    return ", ".join(ranges)


def main() -> None:
    gsf = TTFont(WEB_DIR / "google-sans-flex-latin.woff2")
    gsf_ext = TTFont(WEB_DIR / "google-sans-flex-latin-ext.woff2")
    gsf_cps = set(gsf.getBestCmap().keys())
    gsf_ext_cps = set(gsf_ext.getBestCmap().keys()) - gsf_cps

    hos_reg = TTFont(WEB_DIR / "hos-regular.woff2")
    hos_cps = set(hos_reg.getBestCmap().keys())

    source_files = [
        WEB_DIR / "index.html",
        WEB_DIR / "app.js",
        DRIVE_ROOT / "src" / "http-app.mjs",
        DRIVE_ROOT / "src" / "drive-store.mjs",
    ]
    if AUTH_SDK.exists():
        source_files.append(AUTH_SDK)

    raw_chars = set(EXTRA_UI_TEXT)
    for sf in source_files:
        raw_chars.update(sf.read_text(encoding="utf-8"))

    # UI subset contains every non-GSF character present in HarmonyOS Sans SC
    ui_cps = {ord(ch) for ch in raw_chars if ord(ch) in hos_cps and ord(ch) not in gsf_cps}
    ext_cps = hos_cps - ui_cps - gsf_cps

    for src_name, dst_name in [
        ("hos-regular.woff2", "hos-ui-regular.woff2"),
        ("hos-medium.woff2", "hos-ui-medium.woff2"),
        ("hos-bold.woff2", "hos-ui-bold.woff2"),
    ]:
        font = TTFont(WEB_DIR / src_name)
        opts = Options()
        opts.flavor = "woff2"
        opts.layout_features = ["kern", "mark", "mkmk", "liga"]
        opts.drop_tables += ["vhea", "vmtx", "VORG"]
        opts.name_IDs = [0, 1, 2, 3, 4, 5, 6]
        subsetter = Subsetter(options=opts)
        subsetter.populate(unicodes=ui_cps)
        subsetter.subset(font)
        out_path = WEB_DIR / dst_name
        font.save(out_path)
        print(f"Wrote {dst_name}: {out_path.stat().st_size:,} bytes ({len(ui_cps)} unicodes)")

    manifest = {
        "ui_count": len(ui_cps),
        "ext_count": len(ext_cps),
        "gsf_range": to_unicode_range(gsf_cps),
        "gsf_ext_range": to_unicode_range(gsf_ext_cps),
        "hos_ui_range": to_unicode_range(ui_cps),
        "hos_ext_range": to_unicode_range(ext_cps),
    }
    manifest_path = DRIVE_ROOT / "scripts" / "font-ranges.json"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    import re
    for css_path in [WEB_DIR / "style.css", DRIVE_ROOT / "branding" / "custom.css"]:
        if not css_path.exists():
            continue
        css_text = css_path.read_text(encoding="utf-8")
        updated_css = re.sub(
            r'(url\("[^"]*hos-ui-(?:regular|medium|bold)\.woff2"\)[^}]*?unicode-range:\s*)([^;]+)(;)',
            rf'\g<1>{manifest["hos_ui_range"]}\g<3>',
            css_text,
            flags=re.DOTALL,
        )
        if updated_css != css_text:
            css_path.write_text(updated_css, encoding="utf-8")
            print(f"Synced unicode-range in {css_path.relative_to(DRIVE_ROOT)}")

    print(
        f"Ranges written to {manifest_path.name}: "
        f"ui_range={len(manifest['hos_ui_range'])} chars, ext_range={len(manifest['hos_ext_range'])} chars"
    )


if __name__ == "__main__":
    main()
