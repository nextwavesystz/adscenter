export type VideoCategory = "AC" | "Bajaji" | "Friji" | "Furniture" | "Laptop" | "Magari" | "Majiko" | "Mavazi" | "Pikipiki" | "Simu" | "Spika" | "TV" | "Vyombo";

export interface VideoTask {
  id: number;
  category: VideoCategory;
  title: string;
  videoUrl: string;
  coverUrl: string;
  fallbackImage: string;
  durationSeconds: number;
  rewardTsh: number;
}

export const VIDEO_CATEGORIES: Array<{ id: 'Zote' | VideoCategory; label: string }> = [
  { id: 'Zote', label: 'Zote' },
  { id: "AC", label: "AC" }, { id: "Bajaji", label: "Bajaji" }, { id: "Friji", label: "Friji" }, { id: "Furniture", label: "Furniture" }, { id: "Laptop", label: "Laptop" }, { id: "Magari", label: "Magari" }, { id: "Majiko", label: "Majiko" }, { id: "Mavazi", label: "Mavazi" }, { id: "Pikipiki", label: "Pikipiki" }, { id: "Simu", label: "Simu" }, { id: "Spika", label: "Spika" }, { id: "TV", label: "TV" }, { id: "Vyombo", label: "Vyombo" }
];

export const VIDEO_TASKS: VideoTask[] = [
  {
    "id": 57,
    "category": "Furniture",
    "title": "Kitanda cha Mbao Bei Nafuu",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/5ce720c9-372d-49db-9ef1-bc6de1fb698d/video-57.mp4",
    "coverUrl": "https://tvideo.site/assets/video-57-cover-iXIdar4K.jpg",
    "fallbackImage": "/src/assets/images/cat_furniture_home_1795021484329.jpg",
    "durationSeconds": 25,
    "rewardTsh": 4500
  },
  {
    "id": 35,
    "category": "Vyombo",
    "title": "Duka la Vyombo vya Nyumbani",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/fc57258d-d890-4e4a-b62d-a3933eaba244/video-35.mp4",
    "coverUrl": "https://tvideo.site/assets/video-35-cover-Bm-iXTMD.jpg",
    "fallbackImage": "/src/assets/images/cat_appliances_audio_1795021483351.jpg",
    "durationSeconds": 18,
    "rewardTsh": 3900
  },
  {
    "id": 13,
    "category": "Simu",
    "title": "iPhone XS Max Nyeupe",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/4bed689d-e471-4ad2-86f8-212018ae6f74/video-13.mp4",
    "coverUrl": "https://tvideo.site/assets/video-13-cover-B7GPvRa1.jpg",
    "fallbackImage": "/src/assets/images/cat_smartphones_laptops_1795021482032.jpg",
    "durationSeconds": 31,
    "rewardTsh": 5000
  },
  {
    "id": 70,
    "category": "Friji",
    "title": "Samsung Fridge Side by Side",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/865cb60a-1d0b-4909-855a-e156f257e328/video-70.mp4",
    "coverUrl": "https://tvideo.site/assets/video-70-cover-ha_r_Jfv.jpg",
    "fallbackImage": "/src/assets/images/cat_appliances_audio_1795021483351.jpg",
    "durationSeconds": 12,
    "rewardTsh": 3400
  },
  {
    "id": 48,
    "category": "Mavazi",
    "title": "Nguo za Kike Mitindo Mipya",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/941633a9-5973-4b89-acf4-a27d610272d5/video-48.mp4",
    "coverUrl": "https://tvideo.site/assets/video-48-cover-C6zOwTbd.jpg",
    "fallbackImage": "/src/assets/images/cat_fashion_mobility_1795021484155.jpg",
    "durationSeconds": 59,
    "rewardTsh": 7400
  },
  {
    "id": 26,
    "category": "Spika",
    "title": "JTC Woofer na Microphone",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/7c17a394-ff04-4b4f-85d8-d54c4831be81/video-26.mp4",
    "coverUrl": "https://tvideo.site/assets/video-26-cover-DZ_YOLu5.jpg",
    "fallbackImage": "/src/assets/images/cat_appliances_audio_1795021483351.jpg",
    "durationSeconds": 13,
    "rewardTsh": 3500
  },
  {
    "id": 4,
    "category": "Laptop",
    "title": "Laptop Dell Bei Nafuu",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/cfde5015-d6c4-440c-9760-65673e8a2355/video-4.mp4",
    "coverUrl": "https://tvideo.site/assets/video-4-cover-DIQK8YKZ.jpg",
    "fallbackImage": "/src/assets/images/cat_smartphones_laptops_1795021482032.jpg",
    "durationSeconds": 11,
    "rewardTsh": 3300
  },
  {
    "id": 61,
    "category": "Furniture",
    "title": "Kitanda cha Chumba cha Kisasa",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/0e631d9d-9107-4674-9009-2c1f9ddf3f6e/video-61.mp4",
    "coverUrl": "https://tvideo.site/assets/video-61-cover-DCcM4LAg.jpg",
    "fallbackImage": "/src/assets/images/cat_furniture_home_1795021484329.jpg",
    "durationSeconds": 27,
    "rewardTsh": 4700
  },
  {
    "id": 39,
    "category": "Bajaji",
    "title": "Bajaji Mpya Rangi Mbalimbali",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/04442e6f-2283-410f-8806-2717ed59cfd1/video-39.mp4",
    "coverUrl": "https://tvideo.site/assets/video-39-cover-BKONO7Pi.jpg",
    "fallbackImage": "/src/assets/images/cat_fashion_mobility_1795021484155.jpg",
    "durationSeconds": 40,
    "rewardTsh": 5800
  },
  {
    "id": 17,
    "category": "Simu",
    "title": "Samsung S22 Ultra Bei Nafuu",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/e165aa7c-ab55-4b59-9993-63df296beb9f/video-17.mp4",
    "coverUrl": "https://tvideo.site/assets/video-17-cover-DUSk8rap.jpg",
    "fallbackImage": "/src/assets/images/cat_smartphones_laptops_1795021482032.jpg",
    "durationSeconds": 20,
    "rewardTsh": 4100
  },
  {
    "id": 52,
    "category": "Mavazi",
    "title": "Gauni Maua Nyeupe",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/412d3c6e-a721-4159-845a-b774ed95a008/video-52.mp4",
    "coverUrl": "https://tvideo.site/assets/video-52-cover-Cfc5uOxm.jpg",
    "fallbackImage": "/src/assets/images/cat_fashion_mobility_1795021484155.jpg",
    "durationSeconds": 40,
    "rewardTsh": 5800
  },
  {
    "id": 74,
    "category": "Simu",
    "title": "Galaxy A37 na A57 5G",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/fd66abe5-5724-4695-9239-4a86114db862/video-74.mp4",
    "coverUrl": "https://tvideo.site/assets/video-74-cover-KpTeZWRL.jpg",
    "fallbackImage": "/src/assets/images/cat_smartphones_laptops_1795021482032.jpg",
    "durationSeconds": 38,
    "rewardTsh": 5600
  },
  {
    "id": 30,
    "category": "Furniture",
    "title": "Kitanda na Bedroom Set",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/f0188bbd-48f2-479d-8074-4318b63fb9f3/video-30.mp4",
    "coverUrl": "https://tvideo.site/assets/video-30-cover-NVZt0DYV.jpg",
    "fallbackImage": "/src/assets/images/cat_furniture_home_1795021484329.jpg",
    "durationSeconds": 27,
    "rewardTsh": 4700
  },
  {
    "id": 8,
    "category": "Laptop",
    "title": "HP Elitebook x360",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/cc428afb-761e-4067-b31c-7333486f92b1/video-8.mp4",
    "coverUrl": "https://tvideo.site/assets/video-8-cover-2NMTQZkp.jpg",
    "fallbackImage": "/src/assets/images/cat_smartphones_laptops_1795021482032.jpg",
    "durationSeconds": 21,
    "rewardTsh": 4200
  },
  {
    "id": 65,
    "category": "Spika",
    "title": "JTC Woofer na Microphone",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/f45038b9-d034-4d7a-bfbc-abc042d4fc63/video-65.mp4",
    "coverUrl": "https://tvideo.site/assets/video-65-cover-DIK3h6QF.jpg",
    "fallbackImage": "/src/assets/images/cat_appliances_audio_1795021483351.jpg",
    "durationSeconds": 13,
    "rewardTsh": 3500
  },
  {
    "id": 43,
    "category": "Magari",
    "title": "MG ZS Mpya Nyeupe",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/14bdbc70-4284-45f8-a152-99227bebb131/video-43.mp4",
    "coverUrl": "https://tvideo.site/assets/video-43-cover-sZo5k2lC.jpg",
    "fallbackImage": "/src/assets/images/cat_fashion_mobility_1795021484155.jpg",
    "durationSeconds": 17,
    "rewardTsh": 3800
  },
  {
    "id": 21,
    "category": "Friji",
    "title": "Samsung Fridge Side by Side",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/e7d8798a-fd1b-4a87-97de-c051f0b5eddb/video-21.mp4",
    "coverUrl": "https://tvideo.site/assets/video-21-cover-BP4LtmRL.jpg",
    "fallbackImage": "/src/assets/images/cat_appliances_audio_1795021483351.jpg",
    "durationSeconds": 12,
    "rewardTsh": 3400
  },
  {
    "id": 56,
    "category": "Furniture",
    "title": "Kitanda Kikubwa cha Kisasa",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/08c91eca-ec2b-41ff-b653-25e5e0a5b399/video-56.mp4",
    "coverUrl": "https://tvideo.site/assets/video-56-cover-D2y_Kxee.jpg",
    "fallbackImage": "/src/assets/images/cat_furniture_home_1795021484329.jpg",
    "durationSeconds": 30,
    "rewardTsh": 4900
  },
  {
    "id": 34,
    "category": "Vyombo",
    "title": "Seti ya Vyombo vya Jikoni",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/12f195ab-eaca-4a08-8889-81909acd52a0/video-34.mp4",
    "coverUrl": "https://tvideo.site/assets/video-34-cover-C9x-54RB.jpg",
    "fallbackImage": "/src/assets/images/cat_appliances_audio_1795021483351.jpg",
    "durationSeconds": 12,
    "rewardTsh": 3400
  },
  {
    "id": 12,
    "category": "Simu",
    "title": "iPhone Nyingi Bei Jumla",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/9baea2be-efc5-40e9-bf25-4908b0aeb99f/video-12.mp4",
    "coverUrl": "https://tvideo.site/assets/video-12-cover-DtXAA7Rb.jpg",
    "fallbackImage": "/src/assets/images/cat_smartphones_laptops_1795021482032.jpg",
    "durationSeconds": 18,
    "rewardTsh": 3900
  },
  {
    "id": 69,
    "category": "Friji",
    "title": "Friji ADH 296L Milango Miwili",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/fc776933-8806-42d0-8149-1d871db34853/video-69.mp4",
    "coverUrl": "https://tvideo.site/assets/video-69-cover-CzEyDu5Z.jpg",
    "fallbackImage": "/src/assets/images/cat_appliances_audio_1795021483351.jpg",
    "durationSeconds": 61,
    "rewardTsh": 7600
  },
  {
    "id": 47,
    "category": "Mavazi",
    "title": "Duka la Nguo na Viatu",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/c3844232-91d4-487b-8a42-7ca8e5ead30e/video-47.mp4",
    "coverUrl": "https://tvideo.site/assets/video-47-cover-DWT9RCql.jpg",
    "fallbackImage": "/src/assets/images/cat_fashion_mobility_1795021484155.jpg",
    "durationSeconds": 14,
    "rewardTsh": 3600
  },
  {
    "id": 25,
    "category": "AC",
    "title": "Floor Standing AC Hisense",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/6892b848-00f9-4586-a429-2273da0c43f6/video-25.mp4",
    "coverUrl": "https://tvideo.site/assets/video-25-cover-CPiSO-WK.jpg",
    "fallbackImage": "/src/assets/images/cat_appliances_audio_1795021483351.jpg",
    "durationSeconds": 11,
    "rewardTsh": 3300
  },
  {
    "id": 3,
    "category": "Simu",
    "title": "iPhone Mpya Bei Nafuu",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/4c3f9bfd-10b1-4ddc-ab64-04c5bcd81b4d/video-3.mp4",
    "coverUrl": "https://tvideo.site/assets/video-3-cover-CP3UYGj_.jpg",
    "fallbackImage": "/src/assets/images/cat_smartphones_laptops_1795021482032.jpg",
    "durationSeconds": 10,
    "rewardTsh": 3300
  },
  {
    "id": 60,
    "category": "Furniture",
    "title": "Dressing Table na Kioo",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/7d3caf11-8660-4d86-8f09-c7f1332dfa88/video-60.mp4",
    "coverUrl": "https://tvideo.site/assets/video-60-cover-DVRGjxOY.jpg",
    "fallbackImage": "/src/assets/images/cat_furniture_home_1795021484329.jpg",
    "durationSeconds": 12,
    "rewardTsh": 3400
  },
  {
    "id": 38,
    "category": "Vyombo",
    "title": "Dinner Set ya Kifahari",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/0feb0dbb-2993-4d5a-b560-25feb757a7c8/video-38.mp4",
    "coverUrl": "https://tvideo.site/assets/video-38-cover-BQaGNwRC.jpg",
    "fallbackImage": "/src/assets/images/cat_appliances_audio_1795021483351.jpg",
    "durationSeconds": 57,
    "rewardTsh": 7200
  },
  {
    "id": 16,
    "category": "Simu",
    "title": "Galaxy A37 na A57 5G",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/94640e51-dd70-4aa9-94a3-33f2776acda3/video-16.mp4",
    "coverUrl": "https://tvideo.site/assets/video-16-cover-B1Z0YGxc.jpg",
    "fallbackImage": "/src/assets/images/cat_smartphones_laptops_1795021482032.jpg",
    "durationSeconds": 38,
    "rewardTsh": 5600
  },
  {
    "id": 51,
    "category": "Mavazi",
    "title": "T-shirt na Jeans Set",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/38c29b32-fd33-4405-9227-f4f655247ae6/video-51.mp4",
    "coverUrl": "https://tvideo.site/assets/video-51-cover-B6HuJ11I.jpg",
    "fallbackImage": "/src/assets/images/cat_fashion_mobility_1795021484155.jpg",
    "durationSeconds": 20,
    "rewardTsh": 4100
  },
  {
    "id": 73,
    "category": "Simu",
    "title": "Samsung S22 Ultra Bei Nafuu",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/267fbe92-88f8-44dd-9db9-178558ff5bba/video-73.mp4",
    "coverUrl": "https://tvideo.site/assets/video-73-cover-Dp1co6em.jpg",
    "fallbackImage": "/src/assets/images/cat_smartphones_laptops_1795021482032.jpg",
    "durationSeconds": 20,
    "rewardTsh": 4100
  },
  {
    "id": 29,
    "category": "Vyombo",
    "title": "Majiko na Kitchen Appliances",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/99b6febe-2494-4dbd-97b3-9b55204db398/video-29.mp4",
    "coverUrl": "https://tvideo.site/assets/video-29-cover-BcquibUP.jpg",
    "fallbackImage": "/src/assets/images/cat_appliances_audio_1795021483351.jpg",
    "durationSeconds": 20,
    "rewardTsh": 4100
  },
  {
    "id": 7,
    "category": "Simu",
    "title": "iPhone Pro Mpya",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/8f27ca9b-c917-48a5-8d21-85d6332b12bd/video-7.mp4",
    "coverUrl": "https://tvideo.site/assets/video-7-cover-B9SW6uU2.jpg",
    "fallbackImage": "/src/assets/images/cat_smartphones_laptops_1795021482032.jpg",
    "durationSeconds": 60,
    "rewardTsh": 7500
  },
  {
    "id": 64,
    "category": "Spika",
    "title": "Sony Home Theatre 5.1",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/983f5b90-cf43-4352-82b1-f30177948c58/video-64.mp4",
    "coverUrl": "https://tvideo.site/assets/video-64-cover-57SOM0do.jpg",
    "fallbackImage": "/src/assets/images/cat_appliances_audio_1795021483351.jpg",
    "durationSeconds": 25,
    "rewardTsh": 4500
  },
  {
    "id": 42,
    "category": "Bajaji",
    "title": "Bajaji za Mizigo Mpya",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/7933aa60-bfa1-441a-bc0a-b0e14ca7b3da/video-42.mp4",
    "coverUrl": "https://tvideo.site/assets/video-42-cover-Cumwyi1-.jpg",
    "fallbackImage": "/src/assets/images/cat_fashion_mobility_1795021484155.jpg",
    "durationSeconds": 10,
    "rewardTsh": 3300
  },
  {
    "id": 20,
    "category": "Simu",
    "title": "Samsung Galaxy A80 Nyeupe",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/13852012-acf7-4dad-bafc-d39608be0873/video-20.mp4",
    "coverUrl": "https://tvideo.site/assets/video-20-cover-Bt0gFhs7.jpg",
    "fallbackImage": "/src/assets/images/cat_smartphones_laptops_1795021482032.jpg",
    "durationSeconds": 18,
    "rewardTsh": 3900
  },
  {
    "id": 55,
    "category": "Furniture",
    "title": "Kabati la Nguo Milango 3",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/df8c6b1a-dc3b-4287-88b2-09f669c8ab1e/video-55.mp4",
    "coverUrl": "https://tvideo.site/assets/video-55-cover-IvbA5WT3.jpg",
    "fallbackImage": "/src/assets/images/cat_furniture_home_1795021484329.jpg",
    "durationSeconds": 10,
    "rewardTsh": 3300
  },
  {
    "id": 77,
    "category": "Simu",
    "title": "iPhone XS Max Nyeupe",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/a5819733-550c-46f9-9fe3-c0d9aae3829d/video-77.mp4",
    "coverUrl": "https://tvideo.site/assets/video-77-cover-CEb9_yjd.jpg",
    "fallbackImage": "/src/assets/images/cat_smartphones_laptops_1795021482032.jpg",
    "durationSeconds": 31,
    "rewardTsh": 5000
  },
  {
    "id": 33,
    "category": "TV",
    "title": "Smart TV 55 Bei Nafuu",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/a8ce75e0-c2aa-4455-82a6-e21a4168313e/video-33.mp4",
    "coverUrl": "https://tvideo.site/assets/video-33-cover-DB2rEGER.jpg",
    "fallbackImage": "/src/assets/images/cat_appliances_audio_1795021483351.jpg",
    "durationSeconds": 27,
    "rewardTsh": 4700
  },
  {
    "id": 11,
    "category": "Simu",
    "title": "iPhone 14 Pro Deep Purple",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/dff7ce89-7bf7-40be-9c22-a058edb71c17/video-11.mp4",
    "coverUrl": "https://tvideo.site/assets/video-11-cover-skaVi_t3.jpg",
    "fallbackImage": "/src/assets/images/cat_smartphones_laptops_1795021482032.jpg",
    "durationSeconds": 60,
    "rewardTsh": 7500
  },
  {
    "id": 68,
    "category": "Friji",
    "title": "Hisense 205L TSh 790,000",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/68b5d496-e022-4a57-9146-e751ae533d03/video-68.mp4",
    "coverUrl": "https://tvideo.site/assets/video-68-cover-B09oPtFn.jpg",
    "fallbackImage": "/src/assets/images/cat_appliances_audio_1795021483351.jpg",
    "durationSeconds": 34,
    "rewardTsh": 5300
  },
  {
    "id": 46,
    "category": "Magari",
    "title": "Range Rover Evoque Nyeupe",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/9dc2ef22-cb05-410c-894e-db3d30d67c2a/video-46.mp4",
    "coverUrl": "https://tvideo.site/assets/video-46-cover-DsyfcVHM.jpg",
    "fallbackImage": "/src/assets/images/cat_fashion_mobility_1795021484155.jpg",
    "durationSeconds": 20,
    "rewardTsh": 4100
  },
  {
    "id": 24,
    "category": "Friji",
    "title": "Friji Offer TSh 250,000",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/d40b221e-5215-4c1c-9695-2f98116c5ae4/video-24.mp4",
    "coverUrl": "https://tvideo.site/assets/video-24-cover-CBXn0eWl.jpg",
    "fallbackImage": "/src/assets/images/cat_appliances_audio_1795021483351.jpg",
    "durationSeconds": 12,
    "rewardTsh": 3400
  },
  {
    "id": 2,
    "category": "Laptop",
    "title": "HP Elitebook 1030 Mpya",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/325af705-fcfc-41c3-8989-05204315a97d/video-2.mp4",
    "coverUrl": "https://tvideo.site/assets/video-2-cover-baL-JaEO.jpg",
    "fallbackImage": "/src/assets/images/cat_smartphones_laptops_1795021482032.jpg",
    "durationSeconds": 33,
    "rewardTsh": 5200
  },
  {
    "id": 59,
    "category": "Furniture",
    "title": "Kabati Jeupe la Nguo",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/a542ab00-d4ac-4f09-b9b1-f6e7f8fd8010/video-59.mp4",
    "coverUrl": "https://tvideo.site/assets/video-59-cover-6xAlMRdj.jpg",
    "fallbackImage": "/src/assets/images/cat_furniture_home_1795021484329.jpg",
    "durationSeconds": 19,
    "rewardTsh": 4000
  },
  {
    "id": 37,
    "category": "Majiko",
    "title": "Jiko la Gesi Globalstar",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/cd47526f-a410-4f39-94cf-c2b3e26e8121/video-37.mp4",
    "coverUrl": "https://tvideo.site/assets/video-37-cover-C2GZ5M93.jpg",
    "fallbackImage": "/src/assets/images/cat_appliances_audio_1795021483351.jpg",
    "durationSeconds": 20,
    "rewardTsh": 4100
  },
  {
    "id": 15,
    "category": "Simu",
    "title": "Samsung S25 Ultra",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/f4bd5558-5d06-4f5a-b6a0-7cb51924834f/video-15.mp4",
    "coverUrl": "https://tvideo.site/assets/video-15-cover-dAQUVtuZ.jpg",
    "fallbackImage": "/src/assets/images/cat_smartphones_laptops_1795021482032.jpg",
    "durationSeconds": 17,
    "rewardTsh": 3800
  },
  {
    "id": 50,
    "category": "Mavazi",
    "title": "Vitenge na Magauni Mapya",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/13632238-e475-44e1-9735-0a5a8653ebf9/video-50.mp4",
    "coverUrl": "https://tvideo.site/assets/video-50-cover-DIeKFfGZ.jpg",
    "fallbackImage": "/src/assets/images/cat_fashion_mobility_1795021484155.jpg",
    "durationSeconds": 30,
    "rewardTsh": 4900
  },
  {
    "id": 72,
    "category": "Simu",
    "title": "Simu za Bei Mbalimbali",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/4ad529da-94a5-450c-a0c0-39b85ae382f3/video-72.mp4",
    "coverUrl": "https://tvideo.site/assets/video-72-cover-DlI0_V1y.jpg",
    "fallbackImage": "/src/assets/images/cat_smartphones_laptops_1795021482032.jpg",
    "durationSeconds": 7,
    "rewardTsh": 3000
  },
  {
    "id": 28,
    "category": "Spika",
    "title": "Sound Bar na Subwoofer",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/9cc7bb44-82a2-4a3d-813e-d849c49eba22/video-28.mp4",
    "coverUrl": "https://tvideo.site/assets/video-28-cover-DuuhZAGk.jpg",
    "fallbackImage": "/src/assets/images/cat_appliances_audio_1795021483351.jpg",
    "durationSeconds": 18,
    "rewardTsh": 3900
  },
  {
    "id": 6,
    "category": "Laptop",
    "title": "Dell XPS Slim",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/1a1f89b9-653c-48f2-bca0-cc9dc577595e/video-6.mp4",
    "coverUrl": "https://tvideo.site/assets/video-6-cover-u6MgojNs.jpg",
    "fallbackImage": "/src/assets/images/cat_smartphones_laptops_1795021482032.jpg",
    "durationSeconds": 37,
    "rewardTsh": 5500
  },
  {
    "id": 63,
    "category": "Spika",
    "title": "Vitron Sound Bar na Subwoofer",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/0cace943-d81b-4745-a199-5b8718072f9e/video-63.mp4",
    "coverUrl": "https://tvideo.site/assets/video-63-cover-6Cpj7_Mt.jpg",
    "fallbackImage": "/src/assets/images/cat_appliances_audio_1795021483351.jpg",
    "durationSeconds": 18,
    "rewardTsh": 3900
  },
  {
    "id": 41,
    "category": "Pikipiki",
    "title": "Pikipiki Mpya TVS na Boxer",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/2624bc3a-43d0-4276-be16-083a790a7e78/video-41.mp4",
    "coverUrl": "https://tvideo.site/assets/video-41-cover-B8j83CW4.jpg",
    "fallbackImage": "/src/assets/images/cat_fashion_mobility_1795021484155.jpg",
    "durationSeconds": 35,
    "rewardTsh": 5400
  },
  {
    "id": 19,
    "category": "Simu",
    "title": "Samsung Galaxy S6 Used",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/0e8e04a4-9eb1-47ab-afb9-f0824129f446/video-19.mp4",
    "coverUrl": "https://tvideo.site/assets/video-19-cover-Ce799mk9.jpg",
    "fallbackImage": "/src/assets/images/cat_smartphones_laptops_1795021482032.jpg",
    "durationSeconds": 18,
    "rewardTsh": 3900
  },
  {
    "id": 54,
    "category": "Furniture",
    "title": "Kitanda Nyeupe na Kabati",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/b9bb13b0-219d-46f6-8df4-3dfc0533ac41/video-54.mp4",
    "coverUrl": "https://tvideo.site/assets/video-54-cover-thRnXJlY.jpg",
    "fallbackImage": "/src/assets/images/cat_furniture_home_1795021484329.jpg",
    "durationSeconds": 24,
    "rewardTsh": 4400
  },
  {
    "id": 76,
    "category": "Simu",
    "title": "iPhone Mpya Boksi",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/11226fa8-936b-47e3-8035-100522ed301a/video-76.mp4",
    "coverUrl": "https://tvideo.site/assets/video-76-cover-BcCzbGbu.jpg",
    "fallbackImage": "/src/assets/images/cat_smartphones_laptops_1795021482032.jpg",
    "durationSeconds": 11,
    "rewardTsh": 3300
  },
  {
    "id": 32,
    "category": "TV",
    "title": "TCL QLED 4K Google TV",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/505d45d5-6de0-4a67-8a7f-e2b3a822b3fc/video-32.mp4",
    "coverUrl": "https://tvideo.site/assets/video-32-cover-CR2XMSwj.jpg",
    "fallbackImage": "/src/assets/images/cat_appliances_audio_1795021483351.jpg",
    "durationSeconds": 26,
    "rewardTsh": 4600
  },
  {
    "id": 10,
    "category": "Laptop",
    "title": "HP Envy x360 Nyeupe",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/ae3a07a7-d2cc-42bf-b0bd-23c07252b8bf/video-10.mp4",
    "coverUrl": "https://tvideo.site/assets/video-10-cover-BxR2u61n.jpg",
    "fallbackImage": "/src/assets/images/cat_smartphones_laptops_1795021482032.jpg",
    "durationSeconds": 22,
    "rewardTsh": 4300
  },
  {
    "id": 67,
    "category": "Friji",
    "title": "Friji Offer TSh 250,000",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/bd822fbf-4e74-46fb-866f-571292c0bad6/video-67.mp4",
    "coverUrl": "https://tvideo.site/assets/video-67-cover-CJR60IP5.jpg",
    "fallbackImage": "/src/assets/images/cat_appliances_audio_1795021483351.jpg",
    "durationSeconds": 12,
    "rewardTsh": 3400
  },
  {
    "id": 45,
    "category": "Magari",
    "title": "Toyota Fortuner na Prado",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/97524b25-7d1a-453f-bfe2-737a212dd0a4/video-45.mp4",
    "coverUrl": "https://tvideo.site/assets/video-45-cover-BrZXAVDO.jpg",
    "fallbackImage": "/src/assets/images/cat_fashion_mobility_1795021484155.jpg",
    "durationSeconds": 30,
    "rewardTsh": 4900
  },
  {
    "id": 23,
    "category": "Friji",
    "title": "Hisense 205L Bei TSh 790,000",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/c8e84a84-8b9d-40f9-a484-2ae8803ea594/video-23.mp4",
    "coverUrl": "https://tvideo.site/assets/video-23-cover-DA5XObIe.jpg",
    "fallbackImage": "/src/assets/images/cat_appliances_audio_1795021483351.jpg",
    "durationSeconds": 34,
    "rewardTsh": 5300
  },
  {
    "id": 1,
    "category": "Laptop",
    "title": "Laptop Mpya bei chee",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/1a97a2ad-d962-4604-8a19-9cac6235c536/video-ya-kwanza.mp4",
    "coverUrl": "https://tvideo.site/assets/video-ya-kwanza-cover-EWpdLb-x.jpg",
    "fallbackImage": "/src/assets/images/cat_smartphones_laptops_1795021482032.jpg",
    "durationSeconds": 61,
    "rewardTsh": 7600
  },
  {
    "id": 58,
    "category": "Furniture",
    "title": "Kitanda Cheusi na Dhahabu",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/bfb50eba-a318-4a8b-9437-08c18fca8da5/video-58.mp4",
    "coverUrl": "https://tvideo.site/assets/video-58-cover-DISK9nf_.jpg",
    "fallbackImage": "/src/assets/images/cat_furniture_home_1795021484329.jpg",
    "durationSeconds": 37,
    "rewardTsh": 5500
  },
  {
    "id": 36,
    "category": "Vyombo",
    "title": "Plasticware Ndoo na Sahani",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/7fda21fd-c7ac-4cb2-b205-cf9cbc216d88/video-36.mp4",
    "coverUrl": "https://tvideo.site/assets/video-36-cover-4Qi7brhM.jpg",
    "fallbackImage": "/src/assets/images/cat_appliances_audio_1795021483351.jpg",
    "durationSeconds": 20,
    "rewardTsh": 4100
  },
  {
    "id": 14,
    "category": "Simu",
    "title": "iPhone Mpya Boksi",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/852b7f74-b157-4044-a06e-0bdde4d228d4/video-14.mp4",
    "coverUrl": "https://tvideo.site/assets/video-14-cover-BW8plTkl.jpg",
    "fallbackImage": "/src/assets/images/cat_smartphones_laptops_1795021482032.jpg",
    "durationSeconds": 11,
    "rewardTsh": 3300
  },
  {
    "id": 49,
    "category": "Mavazi",
    "title": "Nguo za Kanisani",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/b9be4092-94c0-417d-bc09-ddd6f8133933/video-49.mp4",
    "coverUrl": "https://tvideo.site/assets/video-49-cover-CLUGbDmP.jpg",
    "fallbackImage": "/src/assets/images/cat_fashion_mobility_1795021484155.jpg",
    "durationSeconds": 19,
    "rewardTsh": 4000
  },
  {
    "id": 71,
    "category": "Simu",
    "title": "Samsung Galaxy S6 Used",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/12753abc-df33-4fb3-a48b-e70f80f8c6f3/video-71.mp4",
    "coverUrl": "https://tvideo.site/assets/video-71-cover-u2jjptxh.jpg",
    "fallbackImage": "/src/assets/images/cat_smartphones_laptops_1795021482032.jpg",
    "durationSeconds": 18,
    "rewardTsh": 3900
  },
  {
    "id": 27,
    "category": "Spika",
    "title": "Sony Home Theatre Sound Bar",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/e022a439-fd3e-44fb-8a69-859831deb2b2/video-27.mp4",
    "coverUrl": "https://tvideo.site/assets/video-27-cover-BLQP4Ob3.jpg",
    "fallbackImage": "/src/assets/images/cat_appliances_audio_1795021483351.jpg",
    "durationSeconds": 25,
    "rewardTsh": 4500
  },
  {
    "id": 5,
    "category": "Laptop",
    "title": "HP Laptop Mpya Boksi",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/e93e5e9b-ba3c-4f3f-adec-93f049853446/video-5.mp4",
    "coverUrl": "https://tvideo.site/assets/video-5-cover-b6ThRiKJ.jpg",
    "fallbackImage": "/src/assets/images/cat_smartphones_laptops_1795021482032.jpg",
    "durationSeconds": 25,
    "rewardTsh": 4500
  },
  {
    "id": 62,
    "category": "Majiko",
    "title": "Duka la Majiko na Microwave",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/4d735a59-6d41-4b21-9bc3-ce9dc6e326b6/video-62.mp4",
    "coverUrl": "https://tvideo.site/assets/video-62-cover-B4wRAtQs.jpg",
    "fallbackImage": "/src/assets/images/cat_appliances_audio_1795021483351.jpg",
    "durationSeconds": 20,
    "rewardTsh": 4100
  },
  {
    "id": 40,
    "category": "Furniture",
    "title": "Kabati Nyeupe la Vyombo",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/3b703e16-6ff5-48dc-8757-a14545c18981/video-40.mp4",
    "coverUrl": "https://tvideo.site/assets/video-40-cover-yiVbP_Ba.jpg",
    "fallbackImage": "/src/assets/images/cat_furniture_home_1795021484329.jpg",
    "durationSeconds": 12,
    "rewardTsh": 3400
  },
  {
    "id": 18,
    "category": "Simu",
    "title": "Simu za Bei Mbalimbali",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/cdaa6d6e-462c-4c11-a988-7edaf6ce1359/video-18.mp4",
    "coverUrl": "https://tvideo.site/assets/video-18-cover-DUZ303v7.jpg",
    "fallbackImage": "/src/assets/images/cat_smartphones_laptops_1795021482032.jpg",
    "durationSeconds": 7,
    "rewardTsh": 3000
  },
  {
    "id": 53,
    "category": "Furniture",
    "title": "Sofa Set ya Sebule",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/114f05be-61a0-44db-a1b7-45ac7312b5c5/video-53.mp4",
    "coverUrl": "https://tvideo.site/assets/video-53-cover-DiBjmEqL.jpg",
    "fallbackImage": "/src/assets/images/cat_furniture_home_1795021484329.jpg",
    "durationSeconds": 31,
    "rewardTsh": 5000
  },
  {
    "id": 75,
    "category": "Simu",
    "title": "Samsung S25 Ultra",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/04d8e837-c7b1-4e0d-b5ff-236e54bfd76f/video-75.mp4",
    "coverUrl": "https://tvideo.site/assets/video-75-cover-k9rWyz28.jpg",
    "fallbackImage": "/src/assets/images/cat_smartphones_laptops_1795021482032.jpg",
    "durationSeconds": 17,
    "rewardTsh": 3800
  },
  {
    "id": 31,
    "category": "TV",
    "title": "TCL QLED TV 55 Inch",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/eb97df5e-bf1d-471b-bec2-025ac9ba4fe7/video-31.mp4",
    "coverUrl": "https://tvideo.site/assets/video-31-cover-m3RH4vHo.jpg",
    "fallbackImage": "/src/assets/images/cat_appliances_audio_1795021483351.jpg",
    "durationSeconds": 26,
    "rewardTsh": 4600
  },
  {
    "id": 9,
    "category": "Laptop",
    "title": "Lenovo Yoga Mpya",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/029dbdca-1417-4da8-b03d-e93a5c66111d/video-9.mp4",
    "coverUrl": "https://tvideo.site/assets/video-9-cover-B0nbHNs1.jpg",
    "fallbackImage": "/src/assets/images/cat_smartphones_laptops_1795021482032.jpg",
    "durationSeconds": 41,
    "rewardTsh": 5900
  },
  {
    "id": 66,
    "category": "AC",
    "title": "Floor Standing AC Hisense",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/9387877f-a9f7-4100-ab41-0d536a282ed0/video-66.mp4",
    "coverUrl": "https://tvideo.site/assets/video-66-cover-6fGGmEat.jpg",
    "fallbackImage": "/src/assets/images/cat_appliances_audio_1795021483351.jpg",
    "durationSeconds": 11,
    "rewardTsh": 3300
  },
  {
    "id": 44,
    "category": "Magari",
    "title": "Mitsubishi RVR Bei Nafuu",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/757ad18d-674a-4683-8669-82db548c19f7/video-44.mp4",
    "coverUrl": "https://tvideo.site/assets/video-44-cover-BJT7H9c0.jpg",
    "fallbackImage": "/src/assets/images/cat_fashion_mobility_1795021484155.jpg",
    "durationSeconds": 47,
    "rewardTsh": 6400
  },
  {
    "id": 22,
    "category": "Friji",
    "title": "Friji ADH 296L Milango Miwili",
    "videoUrl": "https://tvideo.site/__l5e/assets-v1/65d5c38a-aba5-40f2-9190-3794c8238890/video-22.mp4",
    "coverUrl": "https://tvideo.site/assets/video-22-cover-CkN5APm_.jpg",
    "fallbackImage": "/src/assets/images/cat_appliances_audio_1795021483351.jpg",
    "durationSeconds": 61,
    "rewardTsh": 7600
  }
];
