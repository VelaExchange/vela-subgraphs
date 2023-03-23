import { BigInt, JSONValue } from "@graphprotocol/graph-ts"

export const HOUR_IN_SECONDS = 3600
export const DAY_IN_SECONDS = HOUR_IN_SECONDS * 24
export const WEEK_IN_SECONDS = DAY_IN_SECONDS * 7
export const MONTH_IN_SECONDS = DAY_IN_SECONDS * 30
export const  VLP_DECIMALS = BigInt.fromString('1000000000000000000')
export const  MAX_VLP_FOR_Hyper = BigInt.fromString('10000000').times(VLP_DECIMALS)
export const HOUR_INFIX = '-hour-'
export const DAY_INFIX = '-day-'
export const WEEK_INFIX = '-week-'
export const MONTH_INFIX = '-month-'
export const BIG_NUM_ZERO = BigInt.fromString('0')

export const WHITELISTED_TOKEN_ADDRESSES: string[] = '{{ legacy.whitelistedTokenAddresses }}'.split(',')

export const remove_hyper_whitelist: string[] = [
    "0x0688ff6b3a932fd33720176e3e3fb22f135391e2",
    "0x0b99363648efea66689d58a553bb015957083c57",
    "0x0bc887da13e775f9c1c0be20e59a135d97263ccc",
    "0x115f44143700edb827c53b7c291abcb4e3bc5928",
    "0x168c1cfa3d6d706a2648cd81478c7a27ba7fc7d6",
    "0x260e3ef2cdf93e1be2a1eea90f8ae154165acf43",
    "0x2b12c3c2dbfab467fa899114b4996f6bcb455c24",
    "0x30da50f547a02742cc9d3bf613bfc27a53e44f0d",
    "0x3321fe3c739ad26813110cd5908774b8820e821b",
    "0x52cc78aebc2e4c39904770445c02acb8e827b039",
    "0x52ea1a4f963dd1a17ce0aefba41e1fdcd8979013",
    "0x54b90e9cfda67fcd1c81dd505332900bd2f58d21",
    "0x6182c554efbaf57c4742b55c0387ea1d890e4384",
    "0x6b8eb8efd14cc3cf7d7c7b94e8a280e751fdbd5d",
    "0x73e90546fddce264c7341beedb77649610363260",
    "0x78bbdedd45c31f0ae0071ff0e0b6742c2e45b39b",
    "0x7c44830483eccdf977d87e78bd3059f2deebf19e",
    "0x7de83e144efe9626e8711a97af6fe760aec4139b",
    "0x800b09308aaee40a470cc2ba3f4bdfbc3cee4d32",
    "0x8127d2e311619bda01b45bea3ab7c360ebb8362b",
    "0x8426793b4ebfce022997eb4d6303822ca64037f6",
    "0x90d58dc51ea46352be6c7a2ea2648432f467adb9",
    "0x9d1e6c125e943f4b236be4489b5c71c284ad3f20",
    "0xa150da57fe14e1964164fd52b55759c2649c5e9a",
    "0xa2917120c698fb5f2a03e3fd3524bda85a3eaef6",
    "0xb8615203a49ec631078691b1f5da28da0ca3b0b1",
    "0xb8c144d0c88b4a38bea8a100fdb3185b52dd13d1",
    "0xba7e5fba171995c80dab3a76601ad5a8d298d86b",
    "0xc821cc7c2ca9976911d0d3991953ba3cf81e52d8",
    "0xd2b5bb9dd60fd1f16a3c7b02fcd60e2bd98b62d9",
    "0xd53adf794e2915b4f414be1ab2282ca8da56dcfd",
    "0xd8dd92360ffa099e9e5da8c272c54316e17a0ed3",
    "0xdf0e6e08929f224a38c7607bd1fa9fc5127c62a4",
    "0xe12d52275eb64ff18680aa2b081fef8b736cd66d",
    "0xe353f777d869b8ab8050980a9a71737165f328a5",
    "0xf6c16da31eff761a68e37f8ca78ff8aa390ccbba",
    "0xfb3a9055e26033743c5f5a0cf9ddbfcc01b10fc1",
    "0xfc309f1287228e99b1f4f978ef5ba7a020081d5f",
]

export const add_hyper_whitelist: string[] = [
    "0xbc191920f303f7616fff4a8a8a24896c35b0c7da",
    "0x229df921dd05c4035d9926805ab92499cd176643",
    "0x5e8e40cc5861caebc75fa470a48752f157a28024",
    "0x1651bc4250269156aa91d1445ae065e6e1598684",
    "0x2f7479ad52a75eb90a9b2acfb296a39d41828c36",
    "0xfe15b3ddf53fb713d41afd1cb053afed8435d06f",
    "0xd39ec0556b27bea894718c981470a15724278585",
    "0xb644a16a72880438d40ad33b4f7f12dc758b646a",
    "0x2534feb6b41ca1dc42b45ca18c8636cccf22df8b",
    "0xeba242cc74364eace6cd28f166723ed27485ddcb",
    "0x5a537c113eae6b558991d867dbad82fd7e04d22d",
    "0xa3854a0a97abedf78129acaf97adfabd58cc8421",
    "0x27756334f9dd3c3c0820e2f714a487158d2d4340",
    "0xd1db1b014513ffcc2a3b204a8483d9243d08b684",
    "0x605e39d307bad8c70f0124da9f604434d8067488",
    "0x88b629ade280df18180b31ad4bdbecaf6caa1827",
    "0x1c407b143eaddb9c1830707a03f715cc498bea03",
    "0x747811193cd339582929344c74e315339db57446",
    "0x04a388766ad092ee64c0c529a3fdbd04ab5c345f",
    "0x684cfe9aa33820d6c730437c96f659976ef0720c",
    "0xb68a40a8b1e2c4590a47eb66ee6946daa4565700",
    "0x34d765f6cd9a58223014f8c9821138820effb220",
    "0xd78d96b3ae76af183bee5c5e4df60367dcea3e54",
    "0xa57d4a794f62ceecd03017b2f37e4bcf100af8cd",
    "0xf704d714ec68a378dfe0c24825932b9dd38d1ccc",
    "0x2dc03fe79f30c9633b9185ed723de1b02b5d72d2",
    "0x3b30d44df9afffc07a51457e18410c4ca0f90896",
    "0x5b2412b1c2eedd3669cf9a6f044257cf3ad5398c",
    "0xd2f5239c1b613d6e791d662877dad4a9f8020086",
    "0xde2ae368e448369f1e1c1ae6dc94ad5218571047",
    "0xed84fef1f27958b56a404d4c99ab8d352490b6fd",
    "0xf2c8dafa86ec2507acc377af1cd90068e17360a7",
    "0xf733f39134debb3ec637d7cdd9463a5687ab893c",
    "0x19cdb95a4ec9e9c433a0329d7376a242b38410e3",
    "0x6b2a8d18c96ea46c558c5f9caf415f6d03938755",
    "0xa73b1ff66e6efd19f6fb4d38cd0a084e6fb9296a",
    "0xf0c524efa259987199640a75a2168a23d86cf0bf",
    "0xae02f22883732cc4d4f549cfa357ecd8d2d5a299",
    "0xbbc64b125d9582ac40850f81016eedabdf69ac02",
    "0xf8c014bcadea128bc505cf9883e1d31bcca3895b",
    "0xee9b1529d91bb35e67b0c1ca66e990f6c27be1af",
    "0x5393d9451570242f2600da8e857e7492d66c7c91",
    "0x4d145a5e90736ad71cbf0081366625bd9eb170cc",
    "0x1f28f0108f965e2f481b04e39e893ba7b00c4d4e",
    "0x6c56ec6b28f2d1941d6c6b65988ee51dcb6acccb",
    "0x1808168b970c63ab07b4c0a9819031f1f6574e30",
    "0xf0e9c2cd91eb01e89a45d10cb56d733ecfbeed59",
    "0x5b3248e2cd6cbf00450a5d618dc7003538b43eac",
    "0x5a1b255eac9b826a39a3ba93496d268f8f77f130",
    "0x5f0887fbd0abf599f5bb2d46e3a11f58cb879ee0",
    "0x6464c5b38a313354e7ab8d5f9bce68ea2734f6f9",
    "0x7af14f5393457140da152696c75235f812508e5c",
    "0x4ef7a7c9036e1f324f9cd83efa5b3ad94f27f4d1",
    "0x7c930969fcf3e5a5c78bcf2e1cefda3f53e3c8fd",
    "0x4f74cbb294c6101f27cc1e70eb611e15dec8cd31",
    "0x2f2fce05bd2480c80f299b5be4c5db3d7e79959f",
    "0xd03127763e3036790ce32e5814e2741dbf38da38",
    "0x6fa33157d37e3961a8613bf3b4d2ee7b674cf66e",
    "0x60eb2959f551a8e1c0c0fc38a8489d4a9b49741a",
    "0x39d12116298f3b2b55e53e7b99c0bf47041761df",
    "0xed95f77bfe132edb94387ffc54f8acb45feece47",
    "0xf9ba07a909edc35865c40937fa107e75c50595ba",
    "0x1ab0f0daae291916bd2ce46f6aa920192693649b",
    "0x4ec1744d3129f4262d0e2c80de951dc8bc00db87",
    "0x6e43c8cff8983d84bd276da23cf2618b60ec6c57",
    "0x62cf0107243d16bf47cc223f6a4647321c415d92",
    "0x2d9f2dde6ad3fe461b5c08f2e6abdd3f451eef5a",
    "0xb91f22ec5708c831803158e7c352635e0165ed6d",
    "0xf468010e2560de4dc3452ac523b6a338fe999fd6",
    "0x7c336d14e1a6ab376e25aa2ca2fa5520c89576b6",
    "0x76645b84dfd4296579f3a86566f006a0d3760b7d",
    "0x83b7295deab040bc6a66fab3bc559e8575ebba6f",
    "0xec9ebe950cad79fde4139714283145137ce24aad",
    "0xc0c4f529fb3043c574e2fe2ab1cc71f745e055f1",
    "0x7656f15346c1b8fa81bfcf0a1e399b8964ff560e",
    "0xceb485955890264366f0e9d1a84bc1eec51fc8cb",
    "0x296d1fac6aa5295e940d8e1f3de51f474c788d15",
    "0xb02484d6e42c7038c564dcb07d5d6c8487350ab3",
    "0x001c485e42cb2846144fc50ccb896aeb86fa9f7e",
    "0xd1f0d3afe14525812ca4446305fe3a86245ccace",
    "0xf64d63a924b005f237eba17f47793186d4b373e8",
    "0x3dee2d3152302051db7c82f7d18d83e0cb1e8cda",
    "0x098dee2f74df806d73002790eea003d77a48ebea",
    "0x6266431213542bb43beb87d59565d710bdf15c38",
    "0xfefb915dc4ed73fea06eafcc2a5ba3fc06627f53",
    "0x744fdbedfa5f6fedf45e6e2e7756cb84b040864d",
    "0xb50a3877f40ba0a019d45cec9f3d9f01dd4eed0e",
    "0x2e24f1a8a865aced00d8d858ad88a69326ac91bf",
    "0xf59ff9c0ca00b1d3a7eef20faf40418f6a5ec3a9",
    "0x2509668be4bd07ce83ffbc6300660a87b9d4dae3",
    "0x5e159f386b26b38f1d27a5e6059bcc69c233eeec",
    "0x5eaf7c522d5e526592bd626bb173590982ff5279",
    "0x986fcc6b0d290308ad6f6a0e8471f74f53dec06a",
    "0xed53c087b05d1360e78f8a3e4dc59f8d342296f9",
    "0xf7c757597d78bbd8605d465a256cb984c837ef81",
    "0xfa6d427856edadfeb345f5f28b902d11df894335",
    "0xde8cad31f5bd744a59948a54bc737f2326101dcd",
    "0xd122207d746ddd8c346037495e79bf8928faa23e",
    "0x79e313dd623625ad2cbe5d81f355f3d6f21d703e",
    "0xa5728aa3efb687d068d70719f37e3aac8ec30cf2",
    "0x12ff3064a07746462d53958f1f6cf9285eb9cb90",
    "0xf37de319bcf6cb725572ed8c8c6bd90ff57ccb6b",
    "0x506c1739e66793b0c268aa978d7f9f6b4e716ccf",
    "0xaf782115ec0a6c55eb43763ef4ade8dd4e5a7467",
    "0xd765d36e9e309d676ff507cb7cfc890cdcef4406",
    "0x261f77c70b6aff1d6ae0853c63ecfcda8af53c3a",
    "0xa28e0bb360c9bdc58322b82eed104c7304c36694",
    "0xb53eb0fa9d01550be9755b703bae23a7f08305c3",
    "0x30587b740973f8ebcfb59b842f80ef92d8ad45d4",
    "0xe34b87b5ca3a93bff6a2e290f54a808b8ced7ac8",
    "0x4b1b5f5eb8c7b7259aae54607efbeef6330c6099",
    "0xe89150ded8556305e7bd6fd5acbf76af6d974c04",
    "0xbf5310fae4d7a0c6df0452bcda09aefa2748ad59",
    "0x2cd896e533983c61b0f72e6f4bbf809711acc5ce",
    "0x45354ba7fd880cb247f0940818dcc136b282ad3f",
    "0xcb0095ca1c0bd1ee7f3ba2ad1b5590fe4dad3c94",
    "0x0f924c28480ff77ad01ddb9dfcd2d558dee56f05",
    "0x80169b6e6919d0fc3d805a5a8047b53aa224c8b6",
    "0xc1186bb5e56085a26e714c5824cd96858a3f7bf0",
    "0xc54e81beef44436fe276063f4931f7272c06e84e",
    "0xc2a07794d4bade8bb39104b00cd8e48c41df8b0b",
    "0xa61fe8d5d91e83948e4c66c87938f7c52602470e",
    "0xf10920d647bf4fcac10cce3f2ff99dc676fbba37",
    "0xfd09e2d6047780508355ebdf7b4e7f630749d6ec",
    "0xf12ee465881c93160dfa713bc91c664c9f51bd4b",
    "0x3461e03e15329f64b95264e4ffd7079281ae1e48",
    "0x88bfed09d3bb21eef3133f260aee5c9c5a7d508c",
    "0x9e3bcf89caa56f2e52aaf74a707335cb9a7b68a5",
    "0xf33a56b6aa0a6bfee1fe5042f1df5afcd8669c5c",
    "0xdd58a5abc2ddbc4580e1cfcea9208a3e77f0a78d",
    "0xe23b55f09f0e46575ff39df10cab0bcbc2cab74b",
    "0xc5d8f3d60fae11e46f2572b42bb957700e7587c0",
    "0xec965452d02c9eb4fc9a4c05443dd116a349ed2c",
    "0x88d17bcd6b90567b1723a611d71526c892e9eab7",
    "0xd4bf7e73c1df5e93f02ea72c2fb4614920eb4e9b",
    "0x7af6f933e6113e7c1658b8cd4fb60288bd040b22",
    "0x85691be0c592532940be6e06a1c3150f0afd6b2c",
    "0x9a2a659980a8fd84790b456696000c8eba9bc578",
    "0x05ed99aafe5bfc33e1636d57e03f55caf0b0e912",
    "0x23d3c0d5e8226f18bf58bb3c68b149b3d7385936",
    "0x84526649aaa74314b0afb446578758225c536d4e",
    "0xf94dcf902cc7b00410db4368cae8797d7fc2d5ad",
    "0x3e051c89cd06e6867ce98c758fcc665d2148e1bb",
    "0x2fdd04dcc0022daacd3b8e5d6ff9a0d23b02db07",
    "0x4f8db1e75bf70c2b3b078811c2b1c2219238197e",
    "0x7fe5de3ec7a08e5e8ed1f192735a4f44cdd0267b",
    "0x3e0ed5ff61836c1b08a359d7989017c9994cf8b6",
    "0xff3b7d05ed4e7852837572a9c798094b7a52e97d",
    "0x75b9b236801b273003beb57f823b434ae49f1be8",
    "0xd90515a69c82b92992fa3c03d010accb366bf2c1",
    "0xf84bfa23c2ab766c47056011b26e2d12ade5c754",
    "0x027090f33876291f05833029611dd9932471afa2",
    "0x46ea42e1dcb0104ca0b7b2668597bfe7ad603a62",
    "0xf41066a0dc01e073110fc690512048b1d2c85946",
    "0xcab83bb673e34882d4b99980cfce235293506ec5",
    "0xb0c2038c786f3762d244bdab4cd40bface94e94e",
    "0xc2983c7d140a04b0fe017207177e19391e7fda7c",
    "0x939fbd2c0e92625ac070da8d159de77991b53036",
    "0xc819d3c3c702ddf4f65a108cdb0e7639d552d44d",
    "0xa1202ecb231664cb436421f9dd28db635b20d75c",
    "0xbafd9b21d73513943ac8a83586538deeb69b99a3",
    "0x7e0acd64286c5b3c32fadd2df3df4a7b4cb1975d",
    "0xa96c774dbcdad89ee7872078e58d5168170d684e",
    "0x52eb753f528e3113099bbc8304233dbaa49ba9b3",
    "0x6bf044843f83c54c8b8873a229e50136a151dc23",
    "0xfc814453e27c36d906bbb129b42021ab8c2f5e56",
    "0xf05948680522dea87a7d6151c3decb83f1c20b7a",
    "0x92aeace435223c845bebe98a11e8fed917a8845c",
    "0xb093f88c567b9dc711c291349283a113fe828a0b",
    "0x3b10b652f6176c8a88777333e9dc014ed74e05ad",
    "0x16a20a85f8cbe16c35f9769564e17ff927b6a1b9",
    "0xb8a9e0f9ed99f03511ba26e3e3f0fa698d41a78c",
    "0x5656bb20e08793dc306522ef8697f1fc2d67a90d",
    "0x76e4f864bbeb60bee66ff5bbcd32decaf7fbde71",
    "0xaa3600788b72863ff51c8f0db5f10bb65fbfeab4",
    "0x825519f883a0fcc728f78d0c3daafaa2fcd1691f",
    "0x3ee1c068fc9653489a5d03ab925047efeeb4bc26",
    "0xa50f7fc9244a57c4cb93d924996def25adce687f",
    "0x48d732e704b90d77af8ec46fcf5cd75e03afa208",
    "0x984886312107a9ae23b8290d6c1d519a737283a2",
    "0x2b612cb53f1064c7a18f206d5e365bc356a09982",
    "0x64cc07a4c945311453f1db1948a526fc0a46aa5c",
    "0x747708014eb03747897b48b991643e2d346bab09",
    "0x6a565970c37ec3d9a6b7169be0e419e91d173c8f",
    "0x001401f33c772ee5df6b3d57ad6a042a947fd03c",
    "0x5a9c734d86b596b381d042f63fe5fc98c7149ee4",
    "0x7a43537c7d9ab1f6c53746bcf1421c15563d6140",
    "0x7b3188db029212edefe2944912cb9294890be3a3",
    "0xd027e3bc1b4be983002119583d9453f7389d61fd",
    "0xda71fa24ad1f9d26cdd15d6bb1579ab33bf027a7",
    "0xa12dbd826b7270fe9046946b10a628cc2a3e44a9",
    "0xf5f2eb096c72920bdfedb67aba15e9c47ad43cda",
    "0x284a0ae10e15da8c3b53ea5dd11c7e6964dd7d36",
    "0xafa6cc3eb946c253ba796f7c109332ce57a25f5b",
    "0xbcb3a2502cecd819c8a8b69e896cae00146eae0d",
    "0x438fd2a61df383e531d092acc3bbd195ff44c8a8",
    "0xf8c8d18f8bd0eb10cd8d9eeb8c4b186f750c5d1e",
    "0x2b94409feba5aaff9cc4ad04aafe5932db6aa24e",
    "0xc43e3fb4b66274af1cb583ff0dded4b1a3b4049b",
    "0xe1810deba900c828720d8fc3c1c58d56b1451f55",
    "0xaf79312eb821871208ac76a80c8e282f8796964e",
    "0x22b98c82ff6653ad8ef0f9a022693ac41ac73b94",
    "0xd7ca10036c597f01a58369b352da57710943dc46",
    "0x030138d2f5f2757daae2fbb8dfd18870ea908881",
    "0x57cd573fe4e2e9e74360b711d530cfe04db9f835",
    "0xceb1531046b5ceaabffb9aaca9818ca073e775be",
    "0x888ae965e3a84541eb5b8cce7a94b1055806ff37",
    "0x5391c40fd42789fcecf48481761d8828a86a1bb4",
    "0x2d14f7659929d24eab26ef29a1316fdf1e64610b",
    "0xb03e80515b8099fddecb8be16c1724ed79ffb5b0",
    "0x708f9144a8754a88e07493a1718fcc9eca3115e2",
    "0x8c20f20318b6b758b37a72ddcfc70668996e1ddd",
    "0x466400eb01af6ebddc7d4679599c56d19a08c45f",
    "0x1d9ee0b7b6954bb06299202a3cd5acea3fa3a035",
    "0x2b92eeea9e1bb0af1a77d4865ed762cbe111e7cc",
    "0x6857e80312f49ab7223116a778be598b87657b49",
    "0x79344c70a9edd3509e7955970df30cb0655f16ba",
    "0x7a97484f57d98a62b0195d79b9600624744de59c",
    "0x7ebac16cf844214bd924b0cac1d8c6d257ff321e",
    "0x98e7d4bb8f75f3dafbcb692c5701e615b5864e15",
    "0x151ec6f30f62535a64a441c260b3493a6f57e870",
    "0x0c1ca53324a9b43e5468664562db592ca6ef6efa",
    "0x281caa39d1877057f29ba185a7bdc9b66edaff87",
    "0x31b792194af47fe99319b009f32a82f6891d3317",
    "0xa40eac2ad323602a568c5ea56448c6d8f6947522",
    "0x0bc71bb95cc09743e22b1db6c282cdc295ea1989",
    "0xf0524c932c29186ed3d498564b5bf1ef4f87d9dd",
    "0xe0e39b40c5ebb66904f5c11d5438586ec7ce62f4",
    "0x2423f451fe56c17e6f95c843670a674c3c96a2dd",
    "0x8e32bb902f5cdbae197a0d4aa0d5c4f98f8d469b",
    "0x0c2d0db3c18c691e4d1e4490fe6217c9489b6ff8",
    "0x9b357ac61028b30fae42394820cf696deecafa58",
    "0x98adc9781bb4fbed399288510af4a0976ec415e9",
    "0x630431e1a7614911dea1907a348359892d02dde3",
    "0x9b6a453f3cf839bb85bbe60c8ff8b757f5edf321",
    "0x66805d8b82664acab4cbe0c0498889dde9af7841",
    "0x24646d8e3c7b322cb63b584705fef4c26fdc664a",
    "0xde161a444294c97564c59e8bc5193f50f59c6bc5",
    "0x374578423cc9e2439bcbb6b02ee88a97cd8f314a",
    "0x779b10cc89240637b2cf8c21567627a31c8a3e7f",
    "0xc793a102ebb40a9f2c9aa42347d081c112685f38",
    "0xaf6af88ba8ad88dbb92eaac33cb0046c20a17476",
    "0x6311257fc7cb3b1c31cc2d67dcf6aa6ba90c7691",
    "0x186113e44d217117e327c3b16dd547ee42967c06",
    "0x50877b3f45413cb122ac973af1b01b9c927cb535",
    "0x6abf790d3b4a80ebfce25dccbfa07f6f8e5cab1a",
    "0x1f7d9a33d93e8286bbcdd1f9555321577c8a90a9",
    "0x7db034bdf551b330214f29663cd142cdb0f152cd",
    "0x87e696610f11480ed9d01b1e2e26a90eb5832a02",
    "0x2e45e4f2a5aef2e75313cfada5ecb7f420efdf0e",
    "0xb61491c55b93915bf538e6fcde8e381a0e22eced",
    "0x2769d448b72c6c0efc59fc19c5977263d642b6d4",
    "0x7b1768877a8cb5f51adb4c231626dae8f862f881",
    "0xc7fb491752add33e1eee4ae440db58577a14fcdc",
    "0xc12824dfc5d43085065bb81efc374b26b7715bdc",
    "0x8f027841be7dc4944016ccc887ab84d3e23a6b42",
    "0x635454f47bab0b68d4b4c735b773487b15eee461",
    "0xb9208a921c1848ad23eb30fc82e2719c531f18dc",
    "0x308563fac3d841ffe7459549033573de1f487fd9",
    "0x597768e7a6721eb21c2dec7a7c25d680bbba1cfa",
    "0x563e8a53118d426b5d70e2042dbdd5888ac6e727",
    "0x4c53ca026109289ae3c2d33fdcc621288486fc56",
    "0xa153cba146651801ad1f776b98ee164b49a50375",
    "0xc353943e2f2f1af3b7ae272d0366858a650032ab",
    "0x4863c0c63e4867e437cdc5592ef39f479a02b400",
    "0xa6b73c45f9e9522b28cf6b04d9f04cb59b4a0cf0",
    "0x737fbef85a56d4dc0f2e1d2961faa77f2d3e7156",
    "0x1f495304b32db10fd35082de1bed150b87fe1968",
    "0x73f951ad7a3187b7def355950ca2489c4ca6ac6c",
    "0x4939c26c681706f0e780204c7414ae998758a12f",
    "0xe1066fea9370c2b51591b3e3a153a044425c56ec",
    "0x01d748a5a4f66d05b5478b09755210a177461cef",
    "0x2b13a9a626ac6f12f9b7047c4a6cb0f504194a01",
    "0x50d1393a8c5ee410b4b1766a6e3365de7f7ff05d",
    "0x7c1ca185931df15eba6e8f735e1610f97ab22684",
    "0x9607582785808c68646e1b6b0cc3e8cd21e804da",
    "0xaea1e3a30378454ec5def7d781a557d98b5dc8b9",
    "0xaf084423b9333152448e6bb0a1e6bd8cd5bac1be",
    "0xb337d282406f53f25b5d9b0b5e2e641251bbc50c",
    "0xcb389764a2f5cba2b0a2da429715d422fb1ff598",
    "0xfb6c49cf857c6cd67a17ef86f2128399c87e201c",
    "0xad8f57de223a9109954e20c85d6377016c9ae44b",
    "0x37236a82ef8c6b3bd02033caea53edbfd9763817",
    "0xb3c2857265109970d31843aa0661624317a9fc1e",
    "0x05ed404125065d2c823503b37d46479aba960335",
    "0x85011dbe3272f7e93e58e60972daabbafe5e4d9d",
    "0x25e58696fbc8eb88301ee06a57f77d9f0715ec97",
    "0x923b128224c37e5ca9dd6193eee231fcf0a5476a",
    "0x1a53ba2b3fde33784de8e22fa2c850ec29744bb4",
    "0x249cb8fe45e4c55078291947914326d585e0f606",
    "0x4b3d64ff8caf88d358ee4481df8ccf43e0c59ba8",
    "0xb86b5568853c5963dd9b9836f5ec94a15966bbc9",
    "0x207b4ff4c0bdf130d03e6bce9d85b751cea2a512",
    "0xb1ccdd6208ee0e912665c2ecccc75ae2a5ae227d",
    "0x38159a02f7a640dc5279dc81c6d2faed445f805e",
    "0xf5aa0978d13a7e3e6cd9b93a89ce1495bede5560",
    "0x69f3428f6844b5bed485ba6c5bb25a8c23402388",
    "0xe1a9229006d237b23a833c00b056fea8c0a342ca",
    "0x62abd07411eb52d1ed14caa8e1a8987da97b9ba0",
    "0x88d0b1b3ad75fe4f03fa30f8647653bb89c086d3",
    "0x145fd728f64dae01159eabc758cbf04a2edfa3f5",
    "0x0e500c25336769dc40abc2038c9565df2b297934",
    "0x384d600d124fa0e942b647fdc54586a159a2d321",
    "0x9e4a015d3b79e99024c7dc43937b977eacadfce1",
    "0xed1219e4728ba9955b26a16cefa68b1053f00a0e",
    "0xa53043c2d23160b39341b1c0489faeead104d4ce",
    "0xf48e04247e22380782eff99275562d9752016125",
    "0x8ee355abdb31dc131b4c6b3001dd4762f613bcf8",
    "0x2dea73cff53b41816d61bf3900a274f937f530eb",
    "0xc64fcfaeb3c59fb037a4a587e39b17c346dbe517",
    "0xea72673a3b078db84900ddf544ad6f8f705a9022",
    "0xee4007011c7e37813efc86a0d51d92c1b4a3793a",
    "0xa350b1e5b3f94a09332afe661a567459e053da19",
    "0x8f45b5b932a09bf87c48802c6f7e79860b9ed4c3",
    "0xd1c7c163963c3c63f1f48dfa79a20300f2217daf",
    "0xbf4f10970d15b5447a7523520e8dc734ebde6510",
    "0xabfd99a7da59e8b96f1cefa6e35fd03e6831bc10",
    "0x1080875c560be6522de910305847fbeb829e1589",
    "0x45af9cb6df0958ee803b85a8545927698542cd47",
    "0x63d7edf351e6fe2b60469403ca1f1ca948fc0dcf",
    "0x89951bda1ac29770e0bc3935a65ba88b1d622c1a",
    "0x98a0034ada6610bdd249a99d14284f42497242f5",
    "0x9e602c1920443f01cb100a57a7f894df8eb42f66",
    "0xd55d5ed6e49fa1985a91c025ba0f8016cd9a4689",
    "0xe3f9da2babd7b7289bddef96c3b5aa2cd918f61e",
    "0xee4bfd7fe07dbc45f2270191391bd564e0d32c5a",
    "0x55d5fb8b9c9e002cde9eec0737836b2b57040805",
    "0x05710696d8b1d7c83fd0c8620d5877773581fe75",
    "0x05bb0ecffba75a93ba324321f899d6eb8e0b9748",
    "0x2ea7e3cf39d3195bff81c8c9a3230ccc833f4a5e",
    "0x5eb3873dea306aa8db0ed5e09b5e5090550f1b75",
    "0xa6a875041e8658f8028c212415279a376a5349a7",
    "0x794d160dad1d63b23b086847ae5260f3d84f7e6a",
    "0x74cbd4fe951e6013392037f3d7f5600f8b151940",
    "0x8ba5908a107ed29c898b00b498fcce0d88299175",
    "0xf77d10da42e3a13780e64d9ed417ff3f0627bd5e",
    "0x12b581d51c95ad0bb8824e31ce588df0429a5c0c",
    "0x5ce963cd8fb8dbf17c6bf823f7e9186f7b7649be",
    "0x6c75153de1b59cdc85796d846e5f612a4faac187",
    "0xa4815394df4a9b1c4ba1cd1ad5ff77e83e19df47",
]

export function getHourStartDate(timestamp: BigInt): i32 {
    let hourIndex = timestamp.toI32() / HOUR_IN_SECONDS // get unique day within unix history
    return hourIndex * HOUR_IN_SECONDS // want the rounded effect
}

export function getDayStartDate(timestamp: BigInt): i32 {
    let dayIndex = timestamp.toI32() / DAY_IN_SECONDS // get unique day within unix history
    return dayIndex * DAY_IN_SECONDS // want the rounded effect
}

export function getWeekStartDate(timestamp: BigInt): i32 {
    let weekIndex = timestamp.toI32() / WEEK_IN_SECONDS // get unique week within unix history
    return weekIndex * WEEK_IN_SECONDS // want the rounded effect
}

export function getMonthStartDate(timestamp: BigInt): i32 {
    let monthIndex = timestamp.toI32() / MONTH_IN_SECONDS // get unique month within unix history
    return monthIndex * MONTH_IN_SECONDS // want the rounded effect
}


  
export function getAccountDailyTradesId(account: string, timestamp: BigInt): string {
    let startDate = getDayStartDate(timestamp)
    return account.concat(DAY_INFIX).concat(BigInt.fromI32(startDate).toString())
}

export function getAccountHourlyTradesId(account: string, timestamp: BigInt): string {
    let startDate = getHourStartDate(timestamp)
    return account.concat(HOUR_INFIX).concat(BigInt.fromI32(startDate).toString())
}

export function getAccountWeeklyTradesId(account: string, timestamp: BigInt): string {
    let startDate = getWeekStartDate(timestamp)
    return account.concat(WEEK_INFIX).concat(BigInt.fromI32(startDate).toString())
}

export function getAccountMonthlyTradesId(account: string, timestamp: BigInt): string {
    let startDate = getMonthStartDate(timestamp)
    return account.concat(MONTH_INFIX).concat(BigInt.fromI32(startDate).toString())
}