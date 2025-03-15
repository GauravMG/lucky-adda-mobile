if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "/home/essence/.gradle/caches/8.12/transforms/2f70248e6b39888437f31458a8d1737d/transformed/jetified-hermes-android-0.78.0-release/prefab/modules/libhermes/libs/android.x86/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "/home/essence/.gradle/caches/8.12/transforms/2f70248e6b39888437f31458a8d1737d/transformed/jetified-hermes-android-0.78.0-release/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

