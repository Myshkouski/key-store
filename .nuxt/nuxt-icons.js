export default async function (ctx, inject) {
  const icons = {"64x64":"/key-store/assets/icons/icon_64.c1bc4f.png","120x120":"/key-store/assets/icons/icon_120.c1bc4f.png","144x144":"/key-store/assets/icons/icon_144.c1bc4f.png","152x152":"/key-store/assets/icons/icon_152.c1bc4f.png","192x192":"/key-store/assets/icons/icon_192.c1bc4f.png","384x384":"/key-store/assets/icons/icon_384.c1bc4f.png","512x512":"/key-store/assets/icons/icon_512.c1bc4f.png"}
  const getIcon = size => icons[size + 'x' + size] || ''
  inject('icon', getIcon)
}
