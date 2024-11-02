document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.getElementById('contentArea');
    const uploadSection = document.getElementById('uploadSection');
    const toggleUploadBtn = document.getElementById('toggleUpload');
    const imageInput = document.getElementById('imageInput');
    const uploadArea = document.querySelector('.upload-area');
    
    // 其他按钮和面板的获取
    const previewBtn = document.getElementById('previewBtn');
    const resizeBtn = document.getElementById('resizeBtn');
    const convertBtn = document.getElementById('convertBtn');
    const previewPanel = document.getElementById('previewPanel');
    const resizePanel = document.getElementById('resizePanel');
    const convertPanel = document.getElementById('convertPanel');

    const mainDownloadBtn = document.getElementById('downloadBtn');
    let currentImageUrl = null; // 用于存储当前图片的URL

    // 处理图片上传
    function handleImage(file) {
        // 首先隐藏上传区域
        uploadSection.style.display = 'none';
        toggleUploadBtn.style.display = 'inline-flex';

        // 显示内容区域
        contentArea.style.display = 'block';
        
        // 更新文件信息
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileFormat').textContent = file.type.split('/')[1].toUpperCase();
        document.getElementById('fileSize').textContent = formatFileSize(file.size);

        // 预加载图片（用于预览）
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // 更新原始图片信息
                document.getElementById('fileName').textContent = file.name;
                document.getElementById('fileFormat').textContent = file.type.split('/')[1].toUpperCase();
                document.getElementById('fileSize').textContent = formatFileSize(file.size);
                document.getElementById('originalSize').textContent = `${img.naturalWidth} × ${img.naturalHeight}`;
                
                // 正确初始化原始尺寸和比例
                originalWidth = img.naturalWidth;
                originalHeight = img.naturalHeight;
                aspectRatio = originalWidth / originalHeight;
                
                // 设置输入框的初始值
                widthInput.value = originalWidth;
                heightInput.value = originalHeight;
                
                // 更新预览图
                preview.src = e.target.result;
                currentImageUrl = e.target.result;
                
                // 显示内容区域
                contentArea.style.display = 'block';
                
                // 隐藏上传区域，显示新上传按钮
                hideUploadSection();
                toggleUploadBtn.style.display = 'flex';
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // 文件拖放处理
    uploadArea.addEventListener('dragenter', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImage(file);
        } else {
            showNotification('请上传图片文件', 'error');
        }
    });

    // 文件选择处理
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImage(file);
        } else {
            showNotification('请上传片文件', 'error');
        }
    });

    // 切换上传区域显示
    toggleUploadBtn.addEventListener('click', () => {
        if (uploadSection.style.display === 'none') {
            uploadSection.style.display = 'block';
        } else {
            uploadSection.style.display = 'none';
        }
    });

    // 面板切换逻辑
    function togglePanel(panel, button) {
        if (panel.style.display === 'none') {
            showPanel(panel, button);
        } else {
            panel.style.display = 'none';
            button.classList.remove('active');
        }
    }

    // 绑定功能按钮事件
    previewBtn.addEventListener('click', () => togglePanel(previewPanel, previewBtn));
    resizeBtn.addEventListener('click', () => togglePanel(resizePanel, resizeBtn));
    convertBtn.addEventListener('click', () => togglePanel(convertPanel, convertBtn));

    // 绑定面板关闭按钮事件
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const panel = btn.closest('.panel');
            const button = {
                'previewPanel': previewBtn,
                'resizePanel': resizeBtn,
                'convertPanel': convertBtn
            }[panel.id];
            togglePanel(panel, button);
        });
    });

    // 文件大小格式化函数
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    // 通知提示函数
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    let originalWidth = 0;
    let originalHeight = 0;
    let aspectRatio = 1;
    let convertedImageUrl = null;

    // 处理尺寸调整
    const widthInput = document.getElementById('widthInput');
    const heightInput = document.getElementById('heightInput');
    const maintainRatio = document.getElementById('maintainRatio');
    const applySize = document.getElementById('applySize');

    // 宽度变化处理
    widthInput.addEventListener('input', () => {
        if (maintainRatio.checked) {
            const newWidth = parseInt(widthInput.value) || 0;
            const newHeight = Math.round(newWidth / aspectRatio);
            heightInput.value = newHeight;
        }
    });

    // 高度变化处理
    heightInput.addEventListener('input', () => {
        if (maintainRatio.checked) {
            const newHeight = parseInt(heightInput.value) || 0;
            const newWidth = Math.round(newHeight * aspectRatio);
            widthInput.value = newWidth;
        }
    });

    // 保持比例复选框变化处理
    maintainRatio.addEventListener('change', () => {
        if (maintainRatio.checked) {
            // 以当前宽度为基准，调整高度
            const currentWidth = parseInt(widthInput.value) || originalWidth;
            const newHeight = Math.round(currentWidth / aspectRatio);
            heightInput.value = newHeight;
        }
    });

    // 应用尺寸调整
    applySize.addEventListener('click', () => {
        const newWidth = parseInt(widthInput.value) || originalWidth;
        const newHeight = parseInt(heightInput.value) || originalHeight;
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        ctx.drawImage(preview, 0, 0, newWidth, newHeight);

        // 获取原始格式
        const originalFormat = document.getElementById('fileFormat').textContent.toLowerCase();
        let mimeType = 'image/png'; // 默认值

        // 设置对应的MIME类型
        switch (originalFormat) {
            case 'jpeg':
            case 'jpg':
                mimeType = 'image/jpeg';
                break;
            case 'webp':
                mimeType = 'image/webp';
                break;
            case 'gif':
                mimeType = 'image/gif';
                break;
            // PNG和其他格式默认使用image/png
        }

        // 使用原始格式进行转换
        canvas.toBlob((blob) => {
            if (blob) {
                const newImageUrl = URL.createObjectURL(blob);
                
                // 更新预览图
                preview.src = newImageUrl;
                currentImageUrl = newImageUrl;
                
                // 更新新图片信息
                updateNewImageInfo(
                    newWidth,
                    newHeight,
                    originalFormat,
                    blob.size
                );
                
                // 关闭调整大小面板，显示预览
                showPanel(previewPanel, previewBtn);
                showNotification('尺寸调整已应用', 'success');
            }
        }, mimeType, 0.92); // 对于JPEG格式，使用0.92的质量以平衡大小和质量
    });

    // 辅助函数：计算base64图片大小
    function calculateImageSize(dataUrl) {
        const base64Length = dataUrl.split(',')[1].length;
        return Math.floor((base64Length * 3) / 4);
    }

    // 格式转换相关
    const formatSelect = document.getElementById('formatSelect');
    const qualityControl = document.querySelector('.quality-control');
    const qualitySlider = document.getElementById('qualitySlider');
    const qualityValue = document.getElementById('qualityValue');
    const convertImageBtn = document.getElementById('convertImageBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    // 定义格式配置
    const formatConfig = {
        png: {
            mimeType: 'image/png',
            hasQuality: false,
            tip: '* PNG为无损格式，无法调整质量'
        },
        jpeg: {
            mimeType: 'image/jpeg',
            hasQuality: true,
            tip: ''
        },
        webp: {
            mimeType: 'image/webp',
            hasQuality: true,
            tip: ''
        }
    };

    // 格式变化时更新界面
    formatSelect.addEventListener('change', () => {
        const format = formatSelect.value;
        const config = formatConfig[format];
        
        // 控制质量滑块的显示/隐藏
        qualityControl.style.display = config.hasQuality ? 'block' : 'none';
        
        // 更新提示文字
        const qualityTip = document.querySelector('.quality-tip');
        if (qualityTip) {
            qualityTip.textContent = config.tip;
            qualityTip.style.display = config.tip ? 'block' : 'none';
        }
    });

    // 质量滑块处理
    qualitySlider.addEventListener('input', () => {
        qualityValue.textContent = `${qualitySlider.value}%`;
        
        // 实时预览新的文件大小
        updateImageWithQuality(qualitySlider.value);
    });

    // 添加实时预览函数
    function updateImageWithQuality(quality) {
        const format = formatSelect.value;
        const config = formatConfig[format];
        const qualityValue = parseInt(quality) / 100;
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = preview.naturalWidth;
        canvas.height = preview.naturalHeight;
        
        ctx.drawImage(preview, 0, 0);
        
        canvas.toBlob((blob) => {
            if (blob) {
                // 只更新文件大小信息
                document.getElementById('newFileSize').textContent = formatFileSize(blob.size);
                
                // 显示新图片信息面板（如果还没显示）
                const newInfo = document.querySelector('.new-info');
                if (newInfo) {
                    newInfo.style.display = 'block';
                    // 更新其他信息（如果还没设置）
                    if (document.getElementById('newSize').textContent === '-') {
                        document.getElementById('newSize').textContent = `${canvas.width} × ${canvas.height}`;
                    }
                    if (document.getElementById('newFormat').textContent === '-') {
                        document.getElementById('newFormat').textContent = format.toUpperCase();
                    }
                }
            }
        }, config.mimeType, qualityValue);
    }

    // 转换图片
    convertImageBtn.addEventListener('click', () => {
        const format = formatSelect.value;
        const config = formatConfig[format];
        const quality = config.hasQuality ? parseInt(qualitySlider.value) / 100 : undefined;
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = preview.naturalWidth;
        canvas.height = preview.naturalHeight;
        
        ctx.drawImage(preview, 0, 0);
        
        canvas.toBlob((blob) => {
            if (blob) {
                if (convertedImageUrl) {
                    URL.revokeObjectURL(convertedImageUrl);
                }
                convertedImageUrl = URL.createObjectURL(blob);
                preview.src = convertedImageUrl;
                
                // 更新新图片信息
                updateNewImageInfo(
                    canvas.width,
                    canvas.height,
                    format.toUpperCase(),
                    blob.size
                );
                
                showNotification('格式转换成功', 'success');
                showPanel(previewPanel, previewBtn);
            }
        }, config.mimeType, quality);
    });

    // 可以将面板切换逻辑封装为一个函数，方便复用
    function showPanel(panel, button) {
        const allPanels = [previewPanel, resizePanel, convertPanel];
        const allButtons = [previewBtn, resizeBtn, convertBtn];
        
        // 隐藏所有面板
        allPanels.forEach(p => {
            p.style.display = 'none';
        });
        
        // 移除所有按钮的激活状态
        allButtons.forEach(b => {
            b.classList.remove('active');
        });
        
        // 显示指定面板
        panel.style.display = 'block';
        button.classList.add('active');

        // 如果是格式转换面板，初始化格式UI
        if (panel.id === 'convertPanel') {
            const format = formatSelect.value;
            const config = formatConfig[format];
            
            // 控制质量滑块的显示/隐藏
            qualityControl.style.display = config.hasQuality ? 'block' : 'none';
            
            // 更新提示文字
            const qualityTip = document.querySelector('.quality-tip');
            if (qualityTip) {
                qualityTip.textContent = config.tip;
                qualityTip.style.display = config.tip ? 'block' : 'none';
            }
        }
    }

    // 主下载按钮处理
    mainDownloadBtn.addEventListener('click', () => {
        if (currentImageUrl) {
            const link = document.createElement('a');
            // 使用convertedImageUrl（如果存在）或当前图片URL
            const downloadUrl = convertedImageUrl || currentImageUrl;
            link.href = downloadUrl;
            
            // 根据当前状态设置文件名和扩展名
            let fileName = document.getElementById('fileName').textContent;
            let format = formatSelect.value || fileName.split('.').pop();
            
            // 确保文件名有正确的扩展名
            if (!fileName.endsWith(format)) {
                fileName = fileName.split('.')[0] + '.' + format;
            }
            
            link.download = fileName;
            link.click();
            
            // 如果是转换后的URL，使用完后释放
            if (convertedImageUrl) {
                URL.revokeObjectURL(convertedImageUrl);
                convertedImageUrl = null;
            }
        }
    });

    // 更新图片信息显示函数
    function updateNewImageInfo(width, height, format, size) {
        const newInfo = document.querySelector('.new-info');
        newInfo.style.display = 'block';
        
        document.getElementById('newSize').textContent = `${width} × ${height}`;
        document.getElementById('newFormat').textContent = format.toUpperCase();
        document.getElementById('newFileSize').textContent = formatFileSize(size);
    }
}); 