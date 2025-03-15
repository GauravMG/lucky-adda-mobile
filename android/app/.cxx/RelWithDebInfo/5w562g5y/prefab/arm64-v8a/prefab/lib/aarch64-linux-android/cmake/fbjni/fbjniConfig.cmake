if(NOT TARGET fbjni::fbjni)
add_library(fbjni::fbjni SHARED IMPORTED)
set_target_properties(fbjni::fbjni PROPERTIES
    IMPORTED_LOCATION "/home/essence/.gradle/caches/8.12/transforms/1cf5d9d050c6a9e52727a4bbef8fd3ca/transformed/jetified-fbjni-0.7.0/prefab/modules/fbjni/libs/android.arm64-v8a/libfbjni.so"
    INTERFACE_INCLUDE_DIRECTORIES "/home/essence/.gradle/caches/8.12/transforms/1cf5d9d050c6a9e52727a4bbef8fd3ca/transformed/jetified-fbjni-0.7.0/prefab/modules/fbjni/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

