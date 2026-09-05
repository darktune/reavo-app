export const products = [
  // Laptops / Biz
  {
    id: 'macbook-pro-m4',
    name: 'MacBook Pro M4',
    price: 1950000,
    category: 'biz',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800',
    description: 'Pro-grade tools for founders, freelancers, and people who mean business.',
    specs: ['M4 Chip', '18GB RAM', '512GB SSD', 'Liquid Retina XDR'],
    technicalSpecs: {
      Processor: 'Apple M4 Chip (10-core CPU)',
      Memory: '18GB Unified Memory',
      Storage: '512GB SSD',
      Display: '14.2" Liquid Retina XDR',
      Battery: 'Up to 22 hours',
      Ports: '3x Thunderbolt 4, HDMI, MagSafe 3'
    }
  },
  {
    id: 'macbook-air-m2',
    name: 'MacBook Air M2',
    price: 850000,
    category: 'students',
    image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=800',
    description: 'Lightweight power for the modern student.',
    specs: ['M2 Chip', '8GB RAM', '256GB SSD', 'Liquid Retina'],
    technicalSpecs: {
      Processor: 'Apple M2 Chip',
      Memory: '8GB Unified Memory',
      Storage: '256GB SSD',
      Display: '13.6" Liquid Retina',
      Battery: 'Up to 18 hours',
      Ports: '2x Thunderbolt / USB 4, MagSafe 3'
    }
  },
  {
    id: 'rog-strix-g16',
    name: 'ASUS ROG Strix G16',
    price: 1650000,
    category: 'gamers',
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=800',
    description: 'Play harder. Win louder. Built for serious players.',
    specs: ['Core i9', 'RTX 4070', '32GB RAM', '240Hz Display'],
    technicalSpecs: {
      Processor: 'Intel Core i9-13980HX',
      Memory: '32GB DDR5-4800',
      Storage: '1TB PCIe 4.0 NVMe SSD',
      Display: '16" QHD+ 240Hz Nebula Display',
      Battery: '90WHrs, 4-cell Li-ion',
      Ports: '2x USB-A, 1x USB-C (TB4), 1x USB-C, HDMI 2.1'
    }
  },
  
  // Tablets
  {
    id: 'ipad-pro-m4',
    name: 'iPad Pro M4 + Magic Keyboard',
    price: 960000,
    category: 'creators',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=800',
    description: 'Incredibly thin, outrageously powerful.',
    specs: ['M4 Chip', 'OLED Display', 'FaceID', 'Thunderbolt'],
    technicalSpecs: {
      Processor: 'Apple M4 Chip (9-core CPU)',
      Memory: '8GB RAM',
      Storage: '256GB NVMe',
      Display: '11" Ultra Retina XDR (OLED)',
      Battery: '31.29-watt-hour (Up to 10 hours)',
      Ports: '1x Thunderbolt / USB 4'
    }
  },
  {
    id: 'ipad-10th-gen',
    name: 'iPad 10th Gen + Pencil',
    price: 520000,
    category: 'students',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&q=80&w=800',
    description: 'The ultimate notebook replacement.',
    specs: ['A14 Bionic', '10.9" Display', 'USB-C', 'Apple Pencil Support'],
    technicalSpecs: {
      Processor: 'A14 Bionic chip',
      Memory: '4GB RAM',
      Storage: '64GB',
      Display: '10.9" Liquid Retina',
      Battery: 'Up to 10 hours',
      Ports: 'USB-C'
    }
  },
  {
    id: 'samsung-tab-a9',
    name: 'Samsung Galaxy Tab A9+',
    price: 285000,
    category: 'students',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=800',
    description: 'Affordable entertainment and productivity.',
    specs: ['11" Display', '90Hz Refresh', 'Quad Speakers', 'Expandable Storage'],
    technicalSpecs: {
      Processor: 'Snapdragon 695 5G',
      Memory: '4GB RAM',
      Storage: '64GB (MicroSD up to 1TB)',
      Display: '11.0" TFT LCD (90Hz)',
      Battery: '7040 mAh',
      Ports: 'USB-C 2.0'
    }
  },

  // Phones
  {
    id: 'iphone-15-pro',
    name: 'iPhone 15 Pro',
    price: 1250000,
    category: 'creators',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800',
    description: 'Phones that shoot like cinema.',
    specs: ['A17 Pro', '256GB', 'Titanium', '48MP Camera'],
    technicalSpecs: {
      Processor: 'A17 Pro Bionic chip',
      Memory: '8GB RAM',
      Storage: '256GB NVMe',
      Display: '6.1" Super Retina XDR OLED (120Hz)',
      Battery: 'Up to 23 hours video playback',
      Ports: 'USB-C (USB 3 support)'
    }
  },
  {
    id: 'samsung-s24-ultra',
    name: 'Samsung Galaxy S24 Ultra',
    price: 1150000,
    category: 'biz',
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&q=80&w=800',
    description: 'Galaxy AI is here.',
    specs: ['Snapdragon 8 Gen 3', '200MP Camera', 'S Pen', 'Titanium'],
    technicalSpecs: {
      Processor: 'Snapdragon 8 Gen 3 for Galaxy',
      Memory: '12GB RAM',
      Storage: '256GB',
      Display: '6.8" Dynamic AMOLED 2X (120Hz)',
      Battery: '5000 mAh',
      Ports: 'USB-C 3.2'
    }
  },

  // Audio / Wearables
  {
    id: 'airpods-pro-2',
    name: 'AirPods Pro 2',
    price: 285000,
    category: 'students',
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&q=80&w=800',
    description: 'Noise cancellation that keeps you focused on every deadline.',
    specs: ['H2 Chip', 'ANC', 'USB-C', 'MagSafe'],
    technicalSpecs: {
      Processor: 'Apple H2 Headphone Chip',
      Memory: 'N/A',
      Storage: 'N/A',
      Display: 'N/A',
      Battery: 'Up to 6 hours listening (30 hours with case)',
      Ports: 'USB-C (Case)'
    }
  },
  {
    id: 'airpods-max',
    name: 'AirPods Max',
    price: 420000,
    category: 'creators',
    image: 'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?auto=format&fit=crop&q=80&w=800',
    description: 'High-fidelity audio meets industry-leading ANC.',
    specs: ['Over-ear', 'ANC', 'Spatial Audio', 'H1 Chip'],
    technicalSpecs: {
      Processor: 'Apple H1 Headphone Chip (each cup)',
      Memory: 'N/A',
      Storage: 'N/A',
      Display: 'N/A',
      Battery: 'Up to 20 hours',
      Ports: 'Lightning'
    }
  },
  {
    id: 'ipod-7th-gen',
    name: 'iPod 7th Gen 32GB',
    price: 750000,
    category: 'students',
    image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&q=80&w=800',
    description: 'Your music, in your pocket.',
    specs: ['A10 Fusion', '4" Retina', '32GB Storage', 'iOS'],
    technicalSpecs: {
      Processor: 'A10 Fusion chip',
      Memory: '2GB RAM',
      Storage: '32GB',
      Display: '4.0" IPS LCD',
      Battery: 'Up to 40 hours music',
      Ports: 'Lightning, 3.5mm headphone jack'
    }
  },

  // Peripherals & Accessories
  {
    id: 'razer-deathadder-v3',
    name: 'Razer DeathAdder V3',
    price: 48000,
    category: 'gamers',
    image: 'https://images.unsplash.com/photo-1615751072497-5b3b2b6e6e7e?auto=format&fit=crop&q=80&w=800',
    description: 'Ultra-lightweight ergonomic esports mouse.',
    specs: ['59g Weight', '30K Optical Sensor', 'Gen-3 Switches', 'Wired'],
    technicalSpecs: {
      Sensor: 'Focus Pro 30K Optical Sensor',
      Weight: '59g',
      Switches: 'Optical Mouse Switches Gen-3',
      PollingRate: '8000Hz HyperPolling',
      Connectivity: 'Wired - Speedflex Cable'
    }
  },
  {
    id: 'mech-keyboard',
    name: 'Mechanical Gaming Keyboard',
    price: 95000,
    category: 'gamers',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800',
    description: 'Tactile, responsive, and built to last.',
    specs: ['Linear Switches', 'RGB Backlit', 'Hot-swappable', 'Aluminium Frame'],
    technicalSpecs: {
      Switches: 'Linear Mechanical Switches',
      Layout: 'TKL (80%)',
      Lighting: 'Per-key RGB',
      PollingRate: '1000Hz',
      Connectivity: 'USB-C Detachable'
    }
  },
  {
    id: 'anker-powerbank',
    name: 'Anker 26,800mAh Power Bank',
    price: 28000,
    category: 'students',
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&q=80&w=800',
    description: 'Massive capacity to keep you charged on campus all week.',
    specs: ['26,800mAh', 'Dual USB', 'High-Speed Charging', 'MultiProtect'],
    technicalSpecs: {
      Capacity: '26,800 mAh',
      Inputs: 'Micro-USB (2x)',
      Outputs: '3x USB-A',
      OutputPower: '5V/6A (total)',
      Features: 'PowerIQ and VoltageBoost'
    }
  },
  {
    id: 'sony-a7-iv',
    name: 'Sony Alpha A7 IV',
    price: 1950000,
    category: 'photographers',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800',
    description: 'Hybrid camera for photo and cinema-grade video.',
    specs: ['33MP Full-Frame', '4K 60p', '10-bit', 'Real-time AF'],
    technicalSpecs: {
      Processor: 'BIONZ XR image processor',
      Memory: 'Dual SD/CFexpress Type A slots',
      Storage: 'External',
      Display: '3.0" 1.03m-Dot Vari-Angle Touchscreen',
      Battery: 'NP-FZ100 (Approx. 580 shots)',
      Ports: 'USB-C, Micro-USB, HDMI, Mic, Headphone'
    }
  },

  // Institutional Packages (Events/Schools)
  {
    id: 'ipad-classroom-bundle',
    name: 'iPad Classroom Bundle',
    price: 4200000,
    priceDisplay: 'From ₦4,200,000',
    category: 'schools',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=800',
    description: 'Complete digital learning deployment for 20 students.',
    specs: ['20x iPads', 'MDM Setup', 'Charging Cart', 'Apple Pencils'],
    technicalSpecs: {
      Devices: '20x iPad 10th Gen',
      Accessories: '20x Apple Pencil, Protective Cases',
      Storage: '30-Bay Charging Cart',
      Software: 'MDM Configuration Included',
      Support: '1 Year Priority Support'
    }
  },
  {
    id: 'macbook-lab-kit',
    name: 'MacBook Lab Kit',
    price: 4250000,
    priceDisplay: 'From ₦4,250,000',
    category: 'schools',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800',
    description: 'Ready-to-deploy MacBook Airs for computer labs.',
    specs: ['10x MacBook Air', 'Lab Configuration', 'Locking Cabinet', 'Networking'],
    technicalSpecs: {
      Devices: '10x MacBook Air M2',
      Storage: 'Locking Charging Cabinet',
      Software: 'Lab MDM Setup',
      Accessories: 'USB-C Hubs Included',
      Support: '1 Year Priority Support'
    }
  },
  {
    id: 'android-tablet-pack',
    name: 'Android Tablet Pack',
    price: 2500000,
    priceDisplay: 'From ₦2,500,000',
    category: 'schools',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=800',
    description: 'Cost-effective digital learning solution.',
    specs: ['30x Tablets', 'Charging Station', 'Rugged Cases', 'Bulk Setup'],
    technicalSpecs: {
      Devices: '30x Samsung Galaxy Tab A9+',
      Accessories: 'Rugged Drop-proof Cases',
      Storage: '30-Bay Charging Station',
      Software: 'Kiosk Mode Setup',
      Support: '1 Year Priority Support'
    }
  },
  {
    id: 'charging-station-kit',
    name: 'Charging Station Kit',
    price: 500000,
    priceDisplay: 'Quoted on request',
    category: 'events',
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=800',
    description: 'Keep your attendees powered up.',
    specs: ['Custom Branding', 'Multiple Cords', 'Fast Charging', 'Secure Lockers'],
    technicalSpecs: {
      Capacity: 'Up to 24 devices simultaneously',
      Cables: 'Lightning, USB-C, Micro-USB',
      Features: 'Custom branded wrap, Secure PIN lockers',
      Power: 'Requires standard 220V outlet'
    }
  },
  {
    id: 'pa-system-package',
    name: 'PA System Package',
    price: 1500000,
    priceDisplay: 'Quoted on request',
    category: 'events',
    image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=800',
    description: 'Professional audio deployment for campus events.',
    specs: ['Line Array', 'Subwoofers', 'Wireless Mics', 'Mixing Console'],
    technicalSpecs: {
      Speakers: '2x Active Line Array Systems',
      Subs: '2x 18" Active Subwoofers',
      Mics: '4x Shure Wireless Microphones',
      Mixer: '16-Channel Digital Mixer',
      Staff: 'Includes Sound Engineer'
    }
  },
  {
    id: 'livestream-kit',
    name: 'Multi-Camera Livestream Kit',
    price: 2000000,
    priceDisplay: 'Quoted on request',
    category: 'streamers',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800',
    description: 'Broadcast your convocation or summit globally.',
    specs: ['3x 4K Cameras', 'Video Switcher', 'Capture Cards', 'Encoder'],
    technicalSpecs: {
      Cameras: '3x Sony 4K PTZ Cameras',
      Switching: 'ATEM Mini Extreme',
      Encoding: 'Hardware 1080p/4K Streaming',
      Audio: 'XLR Integration to PA',
      Staff: 'Includes Technical Director'
    }
  },
  {
    id: 'stage-lighting',
    name: 'Stage Lighting Package',
    price: 1000000,
    priceDisplay: 'Quoted on request',
    category: 'events',
    image: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&q=80&w=800',
    description: 'Transform any hall into a spectacular venue.',
    specs: ['Moving Heads', 'Wash Lights', 'Atmosphere', 'DMX Control'],
    technicalSpecs: {
      Fixtures: '8x Moving Heads, 12x LED Pars',
      Effects: 'Haze Machine',
      Control: 'DMX Lighting Console',
      Trussing: 'Included based on venue',
      Staff: 'Includes Lighting Technician'
    }
  },
  {
    id: 'reavo-booth',
    name: 'REAVO Trade Fair Booth',
    price: 3500000,
    priceDisplay: 'Quoted on request',
    category: 'events',
    image: 'https://images.unsplash.com/photo-1530435460869-d13625c69bbf?auto=format&fit=crop&q=80&w=800',
    description: 'A complete brand activation setup.',
    specs: ['Custom Build', 'Display Screens', 'Product Tables', 'Lighting'],
    technicalSpecs: {
      Structure: 'Modular Custom Truss Build',
      Displays: '2x 65" 4K TVs',
      Furniture: 'Branded Counters, Stools',
      Logistics: 'Delivery, Setup, and Tear Down Included'
    }
  }
];

export const categories = [
  { id: 'creators', label: 'Creators', color: '#7C5CFF' },
  { id: 'gamers', label: 'Gamers', color: '#B4FF39' },
  { id: 'students', label: 'Students', color: '#3D8BFF' },
  { id: 'biz', label: 'Entrepreneurs', color: '#FFB800' },
  { id: 'schools', label: 'Schools', color: '#FF6B4A' },
  { id: 'photographers', label: 'Photographers', color: '#E84393' },
  { id: 'streamers', label: 'Streamers', color: '#00CEC9' },
  { id: 'events', label: 'Events', color: '#39D9C4' }
];
