export const dataFileTypeCheck = (data: any) => {
  if (!data.file.uri) {
    throw new Error("File URI is missing");
  }

  if (data.file.uri.startsWith("data:")) {
    const mimeMatch = data.file.uri.match(/data:([^;]+)/);
    const mimeType = mimeMatch ? mimeMatch[1] : data.file.type || "video/mp4";
    const fileName = data.file.name || "video.mp4";
    const base64Data = data.file.uri.split(",")[1];

    const payload = {
      ...("name" in data ? { name: data.name } : {}),
      fileData: base64Data,
      fileName: fileName,
      mimeType: mimeType,
    };

    return payload;
  } else {
    const formData = new FormData();
    const fileObject = {
      uri: data.file.uri,
      type: data.file.type || "video/mp4",
      name: data.file.name || "video.mp4",
    };

    formData.append("file", fileObject as any);

    return formData;
  }
};
