export function getGenericFileIconPath(fileType: "image" | "document") {
  return fileType === "image" ? "/icons/png/69.png" : "/icons/png/28.png";
}

export function getTrashFileIconPath(fileName: string) {
  if (/\.(jpg|jpeg|png|gif|webp)$/i.test(fileName)) {
    return "/icons/png/69.png";
  }

  if (/\.(avi|mov|mp4|mkv)$/i.test(fileName)) {
    return "/icons/png/85.png";
  }

  if (/\.(ppt|pptx)$/i.test(fileName)) {
    return "/icons/png/27.png";
  }

  if (/\.(xls|xlsx)$/i.test(fileName)) {
    return "/icons/png/32.png";
  }

  return "/icons/png/28.png";
}
