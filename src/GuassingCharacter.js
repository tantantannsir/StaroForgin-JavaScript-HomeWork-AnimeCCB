import { useState, useEffect, useRef } from 'react';
import { searchCharacters , getCharacterById, getRelatedSubjects, checkAllSubjects} from './BangumiRequest';
import styles from './styles/InputStyles.module.css';
import {
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography 
} from '@mui/material';

function GaussingCharacter(){
    const [inputTerm, setInputTerm] = useState('');
    const [results, setResults] = useState({value: [], completed: false});
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [history, setHistory] = useState({value: [], updated: false});
    const dropdownRef = useRef(null);
    const [isGenerated, setIsGenerated] = useState({origin: {}, flag: false});
    const [openDialog, setOpenDialog] = useState(0);

    const handleCorrectGuess = () => {
        setOpenDialog(1); // 猜对时打开弹窗
    };
    
    const handleFailureGuess = () => {
        setOpenDialog(2);
    };

    const handleClose = () => {
        setOpenDialog(0); // 关闭弹窗
    };

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const sampleRandomCharacters = async () => {
        let randomNumber = 0;
        while(true){
            randomNumber = Math.floor(Math.random() * 178000) + 1;
            const temp = (await getRelatedSubjects(randomNumber)).filter(item => item.type == 2);
            if(temp == null){await sleep(200); continue;}
            if(temp.length == 0){await sleep(200); continue;}
            const response = await getCharacterById(randomNumber);
            if(response.summary == "" || findChineseName(response.infobox) == null){await sleep(200); continue;}
            const relatedres = await checkAllSubjects(temp); 
            if(relatedres.tags != null) relatedres.tags = relatedres.tags.splice(0,10);
            return {person: response, related: relatedres};
        }
    };

    const handleStart = () => {
        sampleRandomCharacters().then((response) => {
            console.log("生成随机角色: ",response);
            setIsGenerated({origin: response, flag: true});
        });
    }

    const findChineseName = (infobox) => {
        const res = infobox.find(item => item.key === "简体中文名");
        return res?.value;
    }

    // 搜索函数
    const handleSearch = () => {
        if (!inputTerm.trim()) {
            setResults({value: [], completed: true});
            return;
        }

        setIsLoading(true);
        setIsOpen(true);
        setResults({value: [], completd: false});
            
        searchCharacters(inputTerm)
        .then(response => {
            setResults({value: response.data, completed: true}); // 标记搜索已完成
            //console.log('搜索结果：',response,results.value,results.completed,typeof results.value,results.value.length);
        })
        .catch(error => {
            console.error('搜索失败:', error);
            setResults({value: [], completd: true}); // 即使出错也标记完成
        })
        .finally(() => {
            setIsLoading(false);
        });
    };
    
    const handleClick = (item) => {
        if(item.id == isGenerated.origin.person.id)
            handleCorrectGuess();
        else if(history.value.length == 9)
            handleFailureGuess();
        getRelatedSubjects(item.id).then((response) => {
            let temp = response.filter(item => (item.type === 2));
            checkAllSubjects(temp).then((resubjects) => {
                let tempitem = {person: item, related: temp, index: history.value.length + 1, informations: resubjects};
                setHistory(previousHistory => {return {value: [...previousHistory.value, tempitem], updated: true}});
            });
        });
    }
    
    const tagCells = (tags) => {
        if (tags == null) return null;
        
        const first10tags = tags.slice(0, 10);
        const stringNames = first10tags.map(item => item?.name);
        const shouldSplit = stringNames.length > 6;
        
        return (
            <Box sx={{display: 'flex',flexDirection: 'column',gap: '4px',width: '100%',maxHeight: shouldSplit ? 'none' : '28px',overflow: 'hidden'}}>
                <Box sx={{display: 'flex',flexWrap: 'wrap',gap: '4px',alignItems: 'center',width: '100%',flexShrink: 0}}>
                    {stringNames.slice(0, shouldSplit ? Math.ceil(stringNames.length/2) : stringNames.length).map((name, index) => (
                        <TagBox name={name} key={index} />
                    ))}
                </Box>
                {shouldSplit && (
                    <Box sx={{display: 'flex',flexWrap: 'wrap', gap: '4px',alignItems: 'center',width: '100%'}}>
                        {stringNames.slice(Math.ceil(stringNames.length/2)).map((name, index) => (
                            <TagBox name={name} key={index + stringNames.length} />
                        ))}
                    </Box>
                )}
                {stringNames.length === 0 && (
                    <Box sx={{ color: 'text.secondary' }}>
                        <p variant="body2">无标签</p>
                    </Box>
                )}
            </Box>
        );
    }

    const checkTagColor = (name) => {
        if(isGenerated.origin == null || isGenerated.origin.related.tags == null) return false;
        console.log("tags: ",name,isGenerated.origin.related.tags);
        for(let item of isGenerated.origin.related.tags)
            if(item.name == name)
                return true;
        return false;
    }

    const TagBox = ({name}) => {
        console.log("TagBox :",name,isGenerated);
        return (
            <Box sx={{
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: checkTagColor(name)? '#90EE90' : 'white',
                padding: '2px 6px',
                width: 'fit-content',
                whiteSpace: 'nowrap',
                fontSize: '0.8125rem',
                lineHeight: 1.2,
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                flexShrink: 0}}>
                {name}
            </Box>
        );
    };

    const yearBox = (ayear, byear) => {
        return (
            <Box sx={{
                border: '0px solid #ccc',
                borderRadius: '4px',
                backgroundColor: ayear == byear? '#90EE90' : ( (-2 <= ayear - byear && ayear - byear <= 2) ? 'yellow' : 'white'),
                padding: '2px 6px',
                width: 'fit-content',
                whiteSpace: 'nowrap',
                fontSize: '0.8125rem',
                lineHeight: 1.2,
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                flexShrink: 0}}>
                {ayear} {ayear < byear ? '↑' : (ayear > byear ? '↓' : '')}
            </Box>
        );
    }

    const favorBox = (afavor, bfavor) => {
        return (
            <Box sx={{
                border: '0px solid #ccc',
                borderRadius: '4px',
                backgroundColor: afavor == bfavor? '#90EE90' : ( (-100 <= afavor - bfavor && afavor - bfavor <= 100) ? 'yellow' : 'white'),
                padding: '2px 6px',
                width: 'fit-content',
                whiteSpace: 'nowrap',
                fontSize: '0.8125rem',
                lineHeight: 1.2,
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                flexShrink: 0}}>
                {afavor} {afavor < bfavor ? '↑' : (afavor > bfavor ? '↓' : '')}
            </Box>
        );
    }

    const countBox = (acount, bcount) => {
        return (
            <Box sx={{
                border: '0px solid #ccc',
                borderRadius: '4px',
                backgroundColor: acount == bcount? '#90EE90' : ( (-2 <= acount - bcount && acount - bcount <= 2) ? 'yellow' : 'white'),
                padding: '2px 6px',
                width: 'fit-content',
                whiteSpace: 'nowrap',
                fontSize: '0.8125rem',
                lineHeight: 1.2,
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                flexShrink: 0}}>
                {acount} {acount < bcount ? '↑' : (acount > bcount ? '↓' : '')}
            </Box>
        );
    }

    const ratingBox = (arating, brating) => {
        return (
            <Box sx={{
                border: '0px solid #ccc',
                borderRadius: '4px',
                backgroundColor: arating == brating? '#90EE90' : ( (-0.5 <= arating - brating && arating - brating <= 0.5) ? 'yellow' : 'white'),
                padding: '2px 6px',
                width: 'fit-content',
                whiteSpace: 'nowrap',
                fontSize: '0.8125rem',
                lineHeight: 1.2,
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                flexShrink: 0}}>
                {arating} {arating < brating ? '↑' : (arating > brating ? '↓' : '')}
            </Box>
        );
    }

    const genderBox = (agender, bgender) => {
        return (
            <Box sx={{
                border: '0px solid #ccc',
                borderRadius: '4px',
                backgroundColor: agender == bgender? '#90EE90' : 'white',
                padding: '2px 6px',
                width: 'fit-content',
                whiteSpace: 'nowrap',
                fontSize: '0.8125rem',
                lineHeight: 1.2,
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                flexShrink: 0}}>
                {agender == 'female' ? '女' : ( agender == 'male' ? '男' : agender)}
            </Box>
        );
    }

    if (!isGenerated.flag) {
        return (
        <div className="App">
            <h1>猜猜呗</h1>
            <button 
                onClick={handleStart}
                className="enter-button"
            >点击开始
            </button>
        </div>
        );
    }

    return (
        <div className="App">
            <h1> 猜猜呗</h1>
            <div>
                <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ textAlign: 'center', fontSize: '1.5rem', color: 'success.main'}}>
                        {openDialog == 1 ? '猜对了！你真棒！' : '非常遗憾，再接再励！'}
                    </DialogTitle>
                    
                    <DialogContent dividers sx={{ textAlign: 'center' }}>
                        <Box sx={{width: '200px',width: '280px',flexShrink: 0, display: 'flex', justifyContent: 'center'}}>
                            <Box 
                                component="img"
                                src={isGenerated.origin.person.images.medium}
                                alt={isGenerated.origin.person.name}
                                sx={{ width: 'auto', height: 'auto%', objectFit: 'cover', borderRadius: 2, border: '1px solid', borderColor: 'divider', justifyContent: 'center'}}
                            />
                        </Box>
                    
                    <Typography variant="h4" component="div" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {findChineseName(isGenerated.origin.person.infobox) || isGenerated.origin.person.name}
                    </Typography>
                    
                    {findChineseName(isGenerated.origin.person.infobox) && (
                        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                        {isGenerated?.origin?.person?.name}
                        </Typography>
                    )}
                    
                    <Typography variant="body1" className={styles.descriptionText} sx={{ mt: 2,textAlign: 'left',maxHeight: 200,overflowY: 'auto',px: 1}}>
                        {isGenerated.origin.person.summary || '暂无简介'}
                    </Typography>
                    </DialogContent>
                    
                    <DialogActions sx={{ justifyContent: 'center', p: 2 }}>
                    <button onClick={handleClose} variant="contained" color="primary" sx={{ minWidth: 120 }}>
                        确定
                    </button>
                    </DialogActions>
                </Dialog>
                </div>
            <div>
            <div className={styles.searchContainer} ref={dropdownRef}>
                <div className={styles.searchBox}>
                    <input type="text" value={inputTerm}
                        onChange={(e) => setInputTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="输入角色名..."
                        className={styles.searchInput}
                    />
                    <button onClick={handleSearch} disabled={isLoading} className={styles.searchButton}>
                        {isLoading ? '搜索中...' : '搜索'}
                    </button>
                </div>

                {/* 下拉框 - 根据状态精确控制显示内容 */}
                {isOpen && isGenerated && (
                    <div className={styles.largeSearchArea}>
                    {isLoading ? (
                        <div className={styles.dropdownItem}>加载中...</div>
                    ) : results.completed ? ( // 只有搜索完成后再判断结果
                        (typeof results.value == typeof [] && results.value.length > 0) ? (
                        results.value.map(item => (
                            <div
                            key={item.id}
                            className={styles.dropdownItem}
                            onClick={() => {
                                handleClick(item);
                                setInputTerm('');
                                setIsOpen(false);
                            }}
                            >
                            <img src={item.images.grid} 
                                alt="远程图像" 
                                style={{ 
                                    width: '50px',
                                    height: '50px',
                                    objectFit: 'cover',
                                    borderRadius: '4px'
                                    }}
                            />
                            {item.name}  {findChineseName(item.infobox)}
                            </div>
                        ))
                        ) : (
                            <div className={styles.dropdownItem}>未找到结果</div>
                        )
                    ) : null}
                    </div>
                )}
            </div>
            <br></br>
            <div>
            <button onClick={() => window.location.reload()}>
                重新开始
            </button>
            <button onClick={handleFailureGuess} className = {styles.failButtonStyle}>
                投降
            </button>
            </div>
            <br></br>
            <div></div>
            <div className={styles.absoluteCenter}>
                剩余次数:{10-history.value.length}
            </div>
            <br></br>
            <div>
                <TableContainer component={Paper}>
                    <Table size="small">
                    <TableHead>
                        <TableRow>
                        <TableCell>序号</TableCell>
                        <TableCell></TableCell>
                        <TableCell>人物名</TableCell>
                        <TableCell>性别</TableCell>
                        <TableCell>
                            <Box display="flex" flexDirection="column">
                                <Box>登场作品数</Box>
                                <Box mt={1}>最高评分</Box>
                            </Box>
                        </TableCell>
                        <TableCell>
                            <Box display="flex" flexDirection="column">
                                <Box>最早登场</Box>
                                <Box mt={1}>最晚登场</Box>
                            </Box>
                        </TableCell>
                        <TableCell>热度</TableCell>
                        <TableCell>标签</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {history.value.length > 0 ? (
                            history.value.map(item => (
                                <TableRow key={item.index}>
                                <TableCell>{item.index}</TableCell>
                                <TableCell><img 
                                    src={item.person.images.grid} 
                                    alt="远程图像" 
                                    style={{ 
                                    width: '50px',
                                    height: '50px',
                                    objectFit: 'cover',
                                    borderRadius: '4px'
                                    }}
                                /></TableCell>
                                <TableCell>{findChineseName(item.person.infobox) == null ? item.person.name : findChineseName(item.person.infobox)}</TableCell>
                                <TableCell>{genderBox(item.person.gender, isGenerated.origin.person.gender)}</TableCell>
                                <TableCell>
                                    <Box display="flex" flexDirection="column">
                                        <Box>{countBox(item.related.length,isGenerated.origin.related.length)}</Box>
                                        <Box>{ratingBox(item.informations.maxrating,isGenerated.origin.related.maxrating)}</Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box display="flex" flexDirection="column">
                                        <Box>{item.informations.oldest == null ? '' : yearBox(item.informations.oldest.year, isGenerated.origin.related.oldest.year)}</Box>
                                        <Box mt={1}>{item.informations.latest == null ? '' : yearBox(item.informations.latest.year, isGenerated.origin.related.latest.year)}</Box>
                                    </Box>
                                </TableCell>
                                <TableCell>{favorBox(item.person.stat.collects,isGenerated.origin.person.stat.collects)}</TableCell>
                                <TableCell>{tagCells(item.informations.tags)}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell 
                                    align="center"
                                    sx={{ 
                                    verticalAlign: 'middle',
                                    height: '20px' // 可选，设置行高
                                    }}
                                >
                                    暂无搜索历史
                                </TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    </Table>
                </TableContainer>
            </div>
            </div>
        </div>
    );
}

export default GaussingCharacter;