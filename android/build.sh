#!/usr/bin/env bash
# Builds a signed release APK without Gradle: aapt2 -> javac -> d8 -> zip -> zipalign -> apksigner.
# Output: ../downloads/dsa-revise.apk
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
OUT_APK="$HERE/../downloads/dsa-revise.apk"
SDK="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
BT="$SDK/build-tools/34.0.0"
JAR="$SDK/platforms/android-34/android.jar"
KEYSTORE="$HOME/.android-keys/dsa-revise.jks"
PASSFILE="$HOME/.android-keys/dsa-revise.pass"
ALIAS="dsarevise"

if [ -z "${JAVA_HOME:-}" ]; then
  JAVA_HOME="$(/usr/libexec/java_home 2>/dev/null || true)"
fi
export JAVA_HOME
JAVAC="${JAVA_HOME:+$JAVA_HOME/bin/}javac"

for f in "$BT/aapt2" "$BT/d8" "$BT/zipalign" "$BT/apksigner" "$JAR" "$KEYSTORE" "$PASSFILE"; do
  [ -e "$f" ] || { echo "Missing: $f" >&2; exit 1; }
done

B="$HERE/build"
rm -rf "$B"
mkdir -p "$B/res" "$B/gen" "$B/classes" "$B/dex" "$(dirname "$OUT_APK")"

echo "==> aapt2 compile/link"
"$BT/aapt2" compile --dir "$HERE/res" -o "$B/res/res.zip"
"$BT/aapt2" link -o "$B/unsigned.apk" -I "$JAR" \
  --manifest "$HERE/AndroidManifest.xml" \
  --java "$B/gen" \
  --min-sdk-version 24 --target-sdk-version 34 \
  --version-code 1 --version-name 1.0 \
  "$B/res/res.zip"

echo "==> javac"
# -parameters works around a d8 8.2 NPE on anonymous classes compiled by newer javac (21+).
"$JAVAC" --release 8 -Xlint:-options -parameters -nowarn -encoding UTF-8 -classpath "$JAR" -d "$B/classes" \
  $(find "$HERE/src" "$B/gen" -name '*.java')

echo "==> d8"
"$BT/d8" --release --min-api 24 --lib "$JAR" --output "$B/dex" $(find "$B/classes" -name '*.class')

echo "==> package"
(cd "$B/dex" && zip -q -j "$B/unsigned.apk" classes.dex)
"$BT/zipalign" -f -p 4 "$B/unsigned.apk" "$B/aligned.apk"

echo "==> sign"
"$BT/apksigner" sign --ks "$KEYSTORE" --ks-key-alias "$ALIAS" \
  --ks-pass "file:$PASSFILE" \
  --out "$OUT_APK" "$B/aligned.apk"
rm -f "$OUT_APK.idsig"
"$BT/apksigner" verify "$OUT_APK"

echo "==> done: $OUT_APK ($(du -h "$OUT_APK" | cut -f1))"
