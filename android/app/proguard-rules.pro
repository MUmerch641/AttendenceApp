# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# Keep all React Native classes
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }

# Keep all model classes for JSON serialization
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod *;
}

# Keep all native methods
-keepclassmembers class * {
    native <methods>;
}

# Keep Hermes bytecode
-keep class com.facebook.jni.** { *; }

# Disable obfuscation (keeps class/method names readable for debugging)
-dontobfuscate

# Keep source file names and line numbers for crash reports
-keepattributes SourceFile,LineNumberTable

# Keep all annotations
-keepattributes *Annotation*

# Keep generic signatures for JSON parsing
-keepattributes Signature

# OkHttp and Retrofit (for API calls)
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }
-keep class okio.** { *; }

# Gson/JSON serialization
-keepclassmembers,allowobfuscation class * {
  @com.google.gson.annotations.SerializedName <fields>;
}
-keep class com.google.gson.** { *; }

# Firebase
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }

# React Native Firebase
-keep class io.invertase.firebase.** { *; }

# Keep JavaScript interface classes
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
