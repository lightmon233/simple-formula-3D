const fs = require('fs');
const path = require('path');

// 传入输入文件名和输出文件名
function convertObjToJson(inputPath, outputPath) {
  if (!fs.existsSync(inputPath)) {
    console.error(`错误：找不到文件 ${inputPath}`);
    return;
  }

  const objText = fs.readFileSync(inputPath, 'utf-8');
  const lines = objText.split('\n');
  
  const vs = [];
  const fsArray = [];
  
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  for (let line of lines) {
    line = line.trim();
    if (line.startsWith('v ')) {
      const parts = line.split(/\s+/).slice(1).map(Number);
      vs.push({ x: parts[0], y: parts[1], z: parts[2] });
      
      if (parts[0] < minX) minX = parts[0]; if (parts[0] > maxX) maxX = parts[0];
      if (parts[1] < minY) minY = parts[1]; if (parts[1] > maxY) maxY = parts[1];
      if (parts[2] < minZ) minZ = parts[2]; if (parts[2] > maxZ) maxZ = parts[2];
    } else if (line.startsWith('f ')) {
      const parts = line.split(/\s+/).slice(1).map(part => {
        const vertexIndex = parseInt(part.split('/')[0]);
        return vertexIndex - 1; // 转换为从 0 开始的索引
      });
      fsArray.push(parts);
    }
  }

  // 居中和缩放（控制在 -0.25 到 0.25 范围内）
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const centerZ = (minZ + maxZ) / 2;
  const maxSpan = Math.max(maxX - minX, maxY - minY, maxZ - minZ);
  const targetScale = 0.5 / maxSpan;

  const finalVs = vs.map(v => ({
    x: (v.x - centerX) * targetScale,
    y: (v.y - centerY) * targetScale,
    z: (v.z - centerZ) * targetScale
  }));

  // 组装成 JSON 对象
  const outputData = {
    vs: finalVs,
    fs: fsArray
  };

  // 写入 JSON 文件
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf-8');
  console.log(`成功！模型已转换并保存至: ${outputPath}`);
  console.log(`总顶点数: ${finalVs.length}, 总面数: ${fsArray.length}`);
}

// 使用方法：node convert.js <你的模型.obj>
const inputFile = process.argv[2] || 'model.obj'; 
const outputFile = path.basename(inputFile, path.extname(inputFile)) + '.json';

convertObjToJson(inputFile, outputFile);
