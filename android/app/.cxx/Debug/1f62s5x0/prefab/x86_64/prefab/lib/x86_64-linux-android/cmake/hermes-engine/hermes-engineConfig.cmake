if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "/home/essence/.gradle/caches/8.12/transforms/d29fe4adbd428832b4bbedeca43dd1f8/transformed/jetified-hermes-android-0.78.0-debug/prefab/modules/libhermes/libs/android.x86_64/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "/home/essence/.gradle/caches/8.12/transforms/d29fe4adbd428832b4bbedeca43dd1f8/transformed/jetified-hermes-android-0.78.0-debug/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

