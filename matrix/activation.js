// ===== 矩阵内容工厂 · 激活码验证系统（含联网一码一机）=====
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const { execSync } = require('child_process');

// ===== Supabase配置（部署时替换） =====
const SUPABASE_URL = 'https://osdjbindqynacswyeqji.supabase.co';
const SUPABASE_KEY = 'sb_publishable_xR3c64MLZPbOl1hPieq2yg_kig7tH8k';

// ===== 200个预生成激活码的SHA256哈希 =====
const ACTIVATION_HASHES = [
  "96f66e3d25315a1ca64dc32ccd12091740542f0ba97be286ff9e84a36f71975f",
  "d665c6db28e8dd24e68cc31fe738f6e557adccbd00ade8ba302d4a06370526b9",
  "49908361becf25a6712a71e8c1a8abd97031fe8851b6da15f122e2ff87a9c2ab",
  "4a7e62842d71d48c01fd344e358d234237c5c56b4b00032003d967dc5bc27978",
  "8206b94bf82440cb754fa5c66d11f914c54a9da780175acc2576aaaf2b085696",
  "dd8f8442e5d91d4da4d51897d1e886e20500fcdf63cd2752a011795ddf849fad",
  "faf294ae406a07175b73c4ed48a0421ac0ede41cb429d558373aaa9ce1b64fc2",
  "9593a6b7614bd571523ce2bf765830d53c72bcf9f08841830fc5a3b5b61d0954",
  "36d0618bf5c0d03fafd8fd836ce7299e21b097e729ebe3bedf09cef1d5ef4e95",
  "a65a9002f107fb6e2cf728be60ad906970627953da2068c8a6f2b2837555e2f8",
  "c5f5e4eee82afaa3ea0b39cbd04f96a3f6383e39bb3ba539e9da3828506fa99e",
  "bdc00cc27773ac30a3063f6c9e3d6c9fb5370f1f5710cdf04154e1fdcfd7fd9f",
  "b04015ab6bf708897209f230c0e59efcdc4a9054280009f94ee7ecef92fba157",
  "ed18c563bcbb35edd0c4a5382d4a982693649cad5b03d981051cbd8af664c0f4",
  "1a5c799734cd7aa32f891dcfc8858217e928e08ebcd9c6a1e8863d5cd5b9a0f6",
  "e6c69187728615809b3eba91d8bcc2d0750156faa8e2ef09a0f07aff2545b1ce",
  "59ae6700ee724e76f65f7e0260e644a14369662769119172fc4d590617a0db63",
  "09b839214a4c7dc93c720b1578a72fbf458eb2d626ff0be32c6205db089d991d",
  "6e25f6640bfb281b5c71c66178599ee0fc9e1079b0787a2a1edc801fdfe6d008",
  "eb0f55b6a125b1e418ee9c0b8501bad0950fa5f709f18dc9be1ed7c4d7ced02b",
  "4e34edbcfcf61c8098b95e65acccf87f97cfcab3b5dacffb156ad36cb09e3a34",
  "ffa39304bfee1936f9b7fd43f44d57cf77c283f61d2f0b83bb921b813ea0bc74",
  "a62640556bd5ee1be5c2deaae0b9a34f85c177e330392b8b393b7dd0e2ef9ed0",
  "c4652f9a95ca2a8b7f1d58195406e4775b01b179d43c810b680ec4e71b3d88b0",
  "ce185519d32de40aaac4179cfe746dc0b4ee002ce7dfdc41764679652339ae72",
  "9ad7448d6f4a5531369f427f6d3d8803c10e8b34517be3c315efa8b86e7bd147",
  "3783972e5ec55637ca8c9476b2054d34579a6f062d80d4d79b16439d6525c15b",
  "2181f4e2a85f5810d19a2450ce84e46329f9f74fa48f28a49eef3c804b566f7d",
  "24d3d054d13626e1d87e0e3dfa0b7422ccc8a855fda60ea221e55d64ec6ad312",
  "bdec4ec0789afc66c8984641bcf39ebe8144f9f48608d7ac8f73d4900b5b3c32",
  "7c5c0faf0a995ccc24e5035d47a534b3a3bf47e3a501639609e31cd9b62f27b3",
  "1fd3cbf6e4d98da088bc1ddb32d16449c48ea7132663f27369f0e35f2db562f9",
  "fcff4d7acf8276ee1d7048d62888799d214e97c5aa8cf2889cd2c87d621ce006",
  "ab139108ad78ec62b73a1559765a74c99941f8dbf28db54160bb93136212ea11",
  "238d4dc545e6585b76872d6b122818b34f21e45d9bcd6bc979273f80424cf198",
  "0c08f12871754e9c44ada263c08d9ece0ef8e1f94071340efe1804389dc89b14",
  "1fcef98483d44a34b1babbe880d6cb25756c4f24dc0aedb76d0dffc3c672950e",
  "8c3e0f20e87fab42e162cfd7d6301c2f9dd000b723087fba3198834ea3ea1c16",
  "338ac56724e0f2d4100f8d6b6e0457e12bc893c07346a105038e8d988fe12916",
  "ae95f35d9222f907513f99383f78d7f2c6e93b8a1449b626129834f219aaece2",
  "2003ef0a0e6592881210f11226e7fb4088c15233d55a6f5fdadd09a9e521163b",
  "aa5ba2c62866042f9c37bc54cee35bc1cc7417c7b8e0af6e42554e5519aeae6a",
  "9511be43d41e439e3129bf4664d3f0f9afb413be5e1fb74a1eff5aa6c8497a49",
  "aeeca9722ec09da227e6c91946a680a9b6ddf97ae08b52c9315193251ada8849",
  "4310e0fadb7f7f0907b381bea1e2d76cff8df6c999edb1c29cc27d9dd5ffd143",
  "0e9b1d91a6d24fa4e1d712452e5b75de0605ac951723a1568157f6d1cf705c50",
  "23240fe19348753cd1c17336b6990c74951df72f382005eb2833d36a02445bb0",
  "6f07d34f96ab4ee96f01462b4ed8206c9eb9d048f5f582a8e7881e824b3ae819",
  "01b4f39cffb4a5b53795b630078523793caf0da335b5dd6301630ae7d471d270",
  "d3ec1a65cbe806e8ce69ae391052300e988fab47d21d3cd272a87a16f0260cf0",
  "7c44114c5ea46404bd455f1d2d554fa715e94bafd7fb66fce57fe37d1c92cc9f",
  "34bed0f82927b3f73d07a10f3324a8d08907a226a4d60d12421d39befda9d6dc",
  "79793a2d9a2ec145096e3813654995295d669a8500cc1468d0f2c91691748d6a",
  "d408515f823f18b8f52e467847168fdb18b53514bd612a2393c3c15563aca3d0",
  "acffde1c826855a83a1f24205c61acb22c38d81ff7912c2f00b4f52cd7308d8a",
  "60130ffb5f00b2b2098c3fde39d6e97ee4f7c1bba38a1b969d4ee486a4fc75ab",
  "c4298edcafefab30027c5fab4395a7755b1d13f8d4edd0c4dcf6a9f8c3d402c3",
  "7a4e1d777111bc82148b4c27fa8b35d40fe6e80254cff635dfc3850a9a3cbf41",
  "7f77ea59d6493242aaacf27801e1c4a66ad83f89baead9920c33ac437d3bd635",
  "fd41cff64329ff7e946efc5e6a3acd50da298c62da9929e7a8f90b2e885e23f7",
  "4752b65f1c0846f7f4358f6b6e434a98681542e226cd687516c18f8bbdbc7b69",
  "840e99c643482589d7620b03f64a9a015d735da57fefa0f94a25da7828c9370f",
  "bcfba5560f947abe445e8b02794a0aabe2b946d6317468b5b8c7a457d91d75cb",
  "4af718167a1d1bd1f493664cb00451b61850bc3a685a7404a018088afc31b781",
  "9ab04f5ba987c01a1c7d79fd00ad4c3143740c1dd313515dd5cdeda4fda9cccf",
  "9ee8323b56be0ecb4344dc4ebec376d3861637ed598f58b13a2682dc9d9b49b5",
  "2dbfda44af41f5395b5bed207934c97627c9351cda7116d68d59968c1cb22eea",
  "7c9d7c9f96b620abf7a9c4667597fa667baff11b2270920fdba15bc3e10e605f",
  "6e21ef7b01dc2740c9bd4d91d32861b849ed32bdb80e2acb1313650079bffaf0",
  "25da7260a3c0ad7e47e7d2bdd8eac9a01f1b3033a6f4bffe9f3644d5cf231d16",
  "240505de9bff3eb522fae531025785c6cd9673b3d1ba8278a6634bb16add035f",
  "29a4984c040976e33909a39607d5972ef763a3064f842cb385bce5c57b35e20a",
  "174216cd3bd13454e368a233d2e97ddb58c1e18cbb01bc2aa2657a10f2639f3a",
  "974aea6a77fe67a59b0c45d60c76936b6af2710ff0587d94ef3ad0ff5a61e81c",
  "3069eb30fd725e57e221387692a9dd4828bfa51bd7d22f0a1c776a7e16dc4360",
  "c9b4f90c1d38d6fbe64fddce831b20602c17773df56cf393ba913f583f638d30",
  "7e79a3b9c9ec72fdebb732eda4101d2cc891eb24370241d66587079696e0915b",
  "3296da16290b0a24722d2b29d3cb95e7d0be72640aedc57af1d38b20636b866d",
  "5fc0311898044c8d7b1390bf99b89687a2147f204257bdfb7a6d5fe50daf8ed8",
  "0e0d2ac4d46c1e036722c016f08cbdce7c873066a6ea899f2ab84f29b3867d1d",
  "47b0f08bc2989e6a8ae2c7ebf17d42480d96b5e44165ae555dd48c260c6a4d14",
  "f5ee2a8931906cfd747ab7e41429eb0709c4ceb2b7151dcb126adff593e057df",
  "89035808b963a7fcbcb987c313026d0204c7cf8ad51a48407ccf0816d38830f1",
  "42a365ea2a05b657c611b10d1f8fe4dac7d6379734d054194cd96df7f67555b4",
  "d91c6a33609a988c912b66956df912ba384cb6662244013abfb74d3d0d50fbd3",
  "e1c589d24a210dcaf318f36ecb0f88ec52e12a293d0e9007b1b0b18b7678f9d9",
  "5ba3b1e13edc7bf73a9b75611d96421dc1e36d30d74c1e1e2124fe6c6ba6ae81",
  "85a75461592ed9c377ad3338709007f438bb6c19b8a1155ca6eac9c3da71b22d",
  "59a42be6614c636245453247f9dc82097b06cc61b5a01b3fd0d220170e3ff76f",
  "b5c2bfc9974335f0fd24c147384a888f4f768dc7963c5038bcfda5719126e03e",
  "e2cf9ce337d69d4eb45a7089c3c5bf668612da6f437b504462c696538d4ca01d",
  "1a7cddc223fd21b4fa4c7fe16d374a0e64f93d4c2432d2aaa3e7e449d5409ebb",
  "c1507cac4bb46c0c66de25d3c2a0514572fb9b1b1446822e9e77785b0d1dd849",
  "7a298038caf5d26f0c664a53a005c6da0823236a2c093cfbed9a8ae00eb691ff",
  "17a5c8396ae0814fe04a85ee49647ae35dee7af350182f23df9ece03cbae4fca",
  "1257f1857cfbedfe99b08cc29364a642ec58e7e758a1383026b225b2455bff02",
  "85318878353dd95d89ba79fbf36d706afa0315f9a89c52abb731c7ddee3467ca",
  "818b9345f39c0ca1a4906e503aa7d284c9fdfb426add944b8a98ced21f7001ef",
  "81b8d75c80d16227b8524e86a4a9488f7be4c79d0786514a98a5cb989dd65083",
  "362545fbcf6978532eb4f212162cea01ff24c4e0feff115f1bb27c1caaa78ec6",
  "2f26624e916e1809754c574543dc96a9ec592ef5030ef7f311b95585099c50a3",
  "e168f0f96d13ab2f4cb3f8a197c13b78dfe81a2672d535ab5e616b422cfab01b",
  "82a0344b16b129e4c5d3eef62d7e9e2363a06d234c5814fc0c09571d3506ed9d",
  "10e78a2eb54338a2b53a0a698e67a7d0d70955535179f499986820ce162fef47",
  "b4530a4aa868c428e38a4691362923911e7431c0e9e2d4e7cb2c550ef7fce078",
  "48bb19426e2bd3e95123a314c67db908dbc8ccdb0bb0ad4473603e22f8c87a02",
  "b67d461142bb3aec88513ec8cb141f1393e5f8d4131d876fb740cc5ca016f16c",
  "3bebbe6560d9434d2ba75452fb7242017ff3bd5740a067f611daff244c9f7531",
  "97f9fe152cfc1a13a686cecf43b302f24a972831b95c3a0d0ee781186b610139",
  "6cc8b33645a6131c325e9181793127e3a361ff7d37e701dc70590cda160c75f3",
  "b8fe9f55f1a20d9435d41bd76936255ac5d6c5dfe9774e746e49721935b62c42",
  "50f51d2c34f57a4da0f5a42fff936ab4fc3042cccd0cdf9bc34abeaac25c42f6",
  "dde573cfeccae1275f4fffe3f4db983a8236c1b43adff23ae7c9742f48875faa",
  "2b701d3ede1899be83bb578bd3222b1cedf0a9ea64ee9aea85545622ef92f3d0",
  "8b7c74c08bbc0d27b12679fc7273ad7861fbc12844d8fee5e6846dfc2d6db0cc",
  "e195a6a0aaee990851633bf5cdfce2ad59b83de374f21b0a00159d70b3353a00",
  "e5bd970d9f575319bad1de8727c32ba8e1db865195d866f3681224d1265a2516",
  "fbee97bff8b2ab8cc9b732a8c353e8d67f420a424c7219350a23d006d77bc359",
  "5b092b2ec266c3235e17f0006fa81876dc7fd95936778f5e591addb2b429331a",
  "8244bae259b2affb86c7be98cc44037c1d8b620f32bb2a576e6d8b0e3e7ce725",
  "042c4b19a537b5d8a8b95fd71329d19f2e57d80d0db9b794f289d4063d299709",
  "a36c9760a5fdbbdddbed5c58bef71fe145801b90b45ae43b30345f8733f3f964",
  "094308fb30872f188d5ec09d34bdee93a2c82b45bcf23470ce8e83ccd62deba4",
  "7ce359861dc6dea764e1e4595d4a8be60e9991e17c49d48b1f9d240af69d7351",
  "3cae5536aedb6b91b658bfe4307126b642a04af4428b2d1004a5996ea173f5db",
  "c93bce0dc6e98a3a327d45996c19181eb57276fae9e364ca70a635c8b00cb774",
  "16d9ccd2d82ace554937929b0a88e2821fb5eec273464e10376c1dd78093c99a",
  "494b9d0ee989cd6913eb1917321d5cc392a3947eab245183c6ffb57c60c08a1a",
  "c66c185d5256f359602e53e84b5a0d6e6351c643c6c6bd08c0e80eec269988f8",
  "efaa604dbf0d606ecb62772ed9d304063a35c6a873f749cc6a4e487a49a27f20",
  "faa71804cc555e6223c2a22b8aca2998f6ceeed9d11b687e60c81b5df68c7870",
  "da8e820591d262ce3148324254c9300cecdb618b12ca3eb75b37c42a573a1dda",
  "365c14bf0565878793f3a44eeb9943e5bee2af15d48b16dfef73315131aabf57",
  "8acedc9407134e38bd65af4c0b266fb6a1f24eb2db850eaa51dee1ebebcebc23",
  "374577dd2930019b805548c2bb6167fba53ceeec0af07b06e2bbd58827bc8a21",
  "7bcc7903a0baeec4add83c74eb90f63cefcd8c0d09fbfa6f8699827e931c9bab",
  "c7207d8669664095e7a04cb5eb9a1557ccf6e5f58cd8ce028fc8e6da59464429",
  "a95d61c1a110b093e4c55cbf9bd1f6b217b87159e2fcc369a1bf26fa470df71b",
  "cf377366be07f02797c13b80b2c24cc9d6ac8190bdfdce5d03543339fb27c7b7",
  "7d7003131599e353f475070e5cf6ecd0a2fac8daf29fae94d2aa076c311499bd",
  "88eb3befa82561057136bfd7225ca27d72125249e29504249f67a4bf8240f316",
  "833da1e1ed37bfa82532f0b1cc2eb9d9fca97cd4af94bb100efe7bfd8a6d236f",
  "f2846a9e6a4a2dc9d51c8c93e17f27e9f0eb0b1c6b5c9e2eac836e7a4f87289f",
  "eaf0d953ec8cfd41638a1cff8ff13a804dac081cfc3fa157800180492f9c5b10",
  "e676196a80fd00a15be0f31f0a17fb4429e657d3bee33beb857ee9563de78f16",
  "2f43c6c962fa81e735ba65dffabaccaba2e594872ca3314bb18113b745c83cd7",
  "bd1301643d58d797d2c41852a2a4bf747fa3dcf2ce8318bd6e51766c76238f4c",
  "496e96e2b6aba912ecfdf21d1e782ddef2bea0eefe187be8e710dbf2ddf2d1c9",
  "9c501649ac53da3d405e36d1732634b0adb3f2f1ef47fee3457cd9812a61f55d",
  "a56c232788482933aaa6fe4cdea94029c1c6ec902a0e88f4e02b6ec045e30895",
  "4251851f390f7526193bfd118b9d7f7ea4803ba53656f896d5273299712f9e99",
  "7dd18a1bcbe6419ef44392f5056ec68287b071cecc268898c2550e1326e5382b",
  "d9b911d8534cad33f7dcad1b20131bca07ebdc211c6127f99064ac6cdd42fe62",
  "cb9bd3007327b06b6eccea698266e29a097ea340793e22a638229a76f0a3691e",
  "bb928393381233f8e7aecf743d375fe1cbfcfa0ab5dbfc63bc013ffccaef2d04",
  "cce2e83a1811f473315ba5e28275b559546f6b8d896d44f22493c82be3948420",
  "b73ce3c378b9a2a873cd3e060fcf59387afb0f0f29f1f96d21b637233be239fd",
  "3e8b8292c6fcb6f1805b289b9c804df65d28bd38aaec63e399561bb9625e8b9c",
  "f9205d6265d9f8113fe437074aa1b17fd0ad65f23c08f2c6a4b27de08cae7c4a",
  "05083b20dc501b0727ed987e49e9ff15e9ef1ed13ac5b71a7b774ba6e6c62808",
  "c5a262afb4958deadc6a1ebf03c038462ae00b53c2efb955debf3c1f2b2c5c20",
  "741fc253e85726e5f50e5deb1323819dbabafef6b1af3723903cd92c1d6280c3",
  "2cbf2673c23f3038432ed73609ea314acba810031d32bb4667603952e8fe370b",
  "f199c8a784f5a237b5219cc2594e47fc5d1809f58324f66127b04b05603a5f07",
  "89e6f3b4eb4944435a0edf9873392c5c2c62125b57f7eacc2544869b0b8a824b",
  "114ac39079f462d7864db898a58e1b00bfb0e3cff297b4fee44935722904e814",
  "12c552cf9fdaf86609638334566668f1ee4a53bbb6c57c70eee459ad084465ec",
  "3b1c1634d0cd56d6b0ed2f9067fb5446d51b4c79e46b5da8541282956867bd09",
  "08e4b2c37fc10d44af7fcfdea26ea7095fce3e8be1dca466ad780490dda6b87f",
  "9525d3c85502d02d1e3bd96197a40b7d1284fc4fa7b36296ce9ece05e4109a1d",
  "b5c54dd10f86dede4dbcf31f3336b4bc85b9f0c05f001307a7d6e29fe3795cdf",
  "b4ec0cafcf7b7096d4671bf36c782decb43a1df11fccd0ad8b393354338b0c50",
  "246f155379b41f57a0c2733d6fab86277f93bc6e31c798a2e61b7e350606f7b2",
  "82d970846aff48d5666966924301eee201242164b1b7f7a9923443b940dbf47c",
  "0e8751665513237dfbb7f869e817309110baf760b0e713e8a755aeb5d5dbca1c",
  "d76f9822e6a70026fb6e60bcaf1bfd65c49903859090957e52acf02d290d2c01",
  "26d92fdab7f6b31304f0b24761e38fee5e1bfe4314044f1591ca5a9417ab72f7",
  "9d5b4fcab710d436056486c087e6cb2bfc9dd287d6a33c0b0a14ba25b4e15c63",
  "4e3a3da4770b051c67071a1bfed2da429e389bca68d15e1fa828adea46002e9c",
  "ac3e3217105ddb5d6a371b700e2d3c52ab185255349560e5fc6a73812f7d1ba3",
  "f086bc0917cd24875e6a81d4b53bad02a62c4fb8f13f3bb38f6e71daf770defe",
  "ff3f2ce899042db196b70d50a51c28f99fffbf39d841cb40d23bab4c81c861da",
  "991abc8767a6d08024e481ea33da6f42431addae14803e5383a9b80938759d01",
  "9c21481b8887cf69475bc4422b3a1038c86e2bd64d56acdd3b3a36b2520b989c",
  "2323ad38348480c8fce41de5387fb737bc052332e014c76c7932271ea23e57ea",
  "0ecf3046c4bdb77f12326b404f89ddc325d2f442e9c3ae38402257058cc264a5",
  "4e73cd76ae721f701435e4f94acb3e920f8d414622ec20997af11ce2c4c38873",
  "15fa19ace0d34b98a3aa3e30c274fa0666f97bb1c9fad65922363529c191d04b",
  "37fd5f734ab024b977777da2cb553981e28a2335ff6a6606f2d6469a1d088b4f",
  "e7eb6211ab0c80fd68c2f5e61def9929b5f93d43db651e88b6ece31571b34b64",
  "f58689b7d1b691a0aa5b668b4fb50645e06973c0c33d23d2c567178a5ea2aaa9",
  "ecf3476ddbdce967e90711ec01b3ab59a5cedc35b53297eaa225ab5a989c8ea2",
  "763a28d93fc07f1fb184064b3ba2ec36de8eeede3b200782003697a894ee5293",
  "bb3123cef69ac00030490a34c26b84474017663430fbf75c19fb6d3bf080dfce",
  "8238d159040f391769d3cf8ca0af52f90a31efdd7412fb766228d3745dcee93b",
  "f2db9bd65b9ff6de99544373f5c00b4930bf22df6fe9df5628568f87dc4b621f",
  "cbb3fee2c6553fe41a38f04bccfb1cd2472c246484131690b5910f415b107a79",
  "a178596f717e56285c0571d774bfb21497189a869fb156e1c214b0c67c7cbaae",
  "2f6c46fde8e63fbbfb494af276a45cf20581ad7fc3586e1f42d1031eedea08eb",
  "61a1f399c682f0d408e97adec9bb97ed9d71e53a36db4414061b963a26675680"
];

// ===== 获取机器唯一ID =====
function getMachineId() {
  try {
    if (process.platform === 'win32') {
      const output = execSync('wmic csproduct get uuid', { encoding: 'utf8', windowsHide: true, timeout: 5000 });
      const lines = output.split('\n').map(l => l.trim()).filter(l => l && l !== 'UUID');
      if (lines[0] && lines[0].length > 10) return lines[0];
    } else if (process.platform === 'darwin') {
      const output = execSync("ioreg -rd1 -c IOPlatformExpertDevice | grep IOPlatformUUID", { encoding: 'utf8', timeout: 5000 });
      const match = output.match(/"IOPlatformUUID"\s*=\s*"([^"]+)"/);
      if (match && match[1]) return match[1];
    }
  } catch (e) { /* fallback below */ }

  // 兜底：MAC+主机名哈希
  const interfaces = os.networkInterfaces();
  let mac = '';
  for (const iface of Object.values(interfaces)) {
    for (const info of iface) {
      if (!info.internal && info.mac && info.mac !== '00:00:00:00:00:00') { mac = info.mac; break; }
    }
    if (mac) break;
  }
  return crypto.createHash('sha256').update(mac + '|' + os.hostname() + '|' + (os.cpus()[0]?.model || '')).digest('hex').slice(0, 36).toUpperCase();
}

// ===== HTTPS请求工具 =====
function httpsPost(url, data, headers) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request({
      hostname: parsed.hostname,
      port: 443,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      timeout: 15000
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch (e) { resolve({ status: res.statusCode, data: body }); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.write(JSON.stringify(data));
    req.end();
  });
}

// ===== 本地验证 =====
function isActivated(baseDir) {
  return fs.existsSync(path.join(baseDir, '.activated'));
}

function verifyCode(code) {
  const hash = crypto.createHash('sha256').update(code.toUpperCase().trim()).digest('hex');
  return ACTIVATION_HASHES.includes(hash);
}

function markActivated(baseDir) {
  fs.writeFileSync(path.join(baseDir, '.activated'), '1', 'utf8');
}

// ===== 联网验证（一码一机）=====
async function verifyOnline(code, product = 'matrix') {
  if (SUPABASE_URL === '__SUPABASE_URL__' || !SUPABASE_URL.startsWith('http')) {
    // 未配置Supabase，跳过联网验证（开发模式）
    return { status: 'valid', message: '离线模式' };
  }

  const machineId = getMachineId();
  const codeHash = crypto.createHash('sha256').update(code.toUpperCase().trim()).digest('hex');
  const deviceInfo = `${process.platform}_${os.hostname()}_${os.arch()}`;

  try {
    const result = await httpsPost(
      `${SUPABASE_URL}/rest/v1/rpc/verify_activation`,
      { p_code_hash: codeHash, p_machine_id: machineId, p_product: product, p_device_info: deviceInfo },
      { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    );
    if (result.status === 200 && result.data) return result.data;
    return { status: 'network_error', message: '验证服务响应异常' };
  } catch (err) {
    return { status: 'network_error', message: '无法连接验证服务器' };
  }
}

module.exports = { isActivated, verifyCode, markActivated, verifyOnline, getMachineId };
