import styles from './styles/InputStyles.module.css';
import React, { useState } from 'react';
import {saveProblemToFile, importProblemFromFile, printProblems} from './SaveProblem.js';

function SubmitProblem(){
  const [mainContent, setMainContent] = useState('');
  const [dynamicInputFields, setDynamicInputFields] = useState([{id : Date.now(), value : ''}]);
  const addInputField = () => {
    setDynamicInputFields([...dynamicInputFields, {id : Date.now(), value : ''}]);
  };
  const removeInputField = (id) => {
    const newInputFields = dynamicInputFields.filter(field => field.id != id);
    setDynamicInputFields(newInputFields);
  };
  const handleDynamicInputChange = (id,value) => {
    const newInputFields = dynamicInputFields.map(inputField => {
      if (inputField.id === id){
        return {...inputField, value};
      }
      return inputField;
    });
    setDynamicInputFields(newInputFields);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const formdata={descriptionText : mainContent,choices : dynamicInputFields.map(input => input.value)};
    if (formdata.descriptionText.trim() === '') {
      alert('题目不能为空');
    }else{
      console.log('题目描述：',formdata.descriptionText);
      for(let choice of formdata.choices)
          console.log('题目选项: ',choice);
      saveProblemToFile(formdata);
      alert('题目已提交');
      printProblems();
    }
  };
  return (
    <div className="App">
        <div>
          <h1>提交题目</h1>
        </div>
        <div>
          <form onSubmit = {handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <p><label htmlFor="description">题目描述:</label></p>
                <textarea value={mainContent} onChange={(e) => setMainContent(e.target.value)} rows="20" cols="60" id="description" name = "description" placeholder="在这里输入内容"></textarea>
            </div>
            <div style={{ marginBottom: '20px'}}>
              <h3>选项<button type="button" onClick={addInputField} className={styles.buttonStyle}>添加选项</button>:</h3>
              {dynamicInputFields.map((input) => (
                <div key={input.id} style={{marginBottom: '18px',display:'flex',justifyContent: 'center',alignItems: 'center'}}>
                  <input type="text" value={input.value} onChange={(e) => handleDynamicInputChange(input.id,e.target.value)} className={styles.standardInput} placeholder="在这里输入选项"></input>
                  <button type="button" onClick={() => removeInputField(input.id)} className={styles.buttonStyle}>删除</button>
                </div>
              ))}
            </div>
            <button id="submitBtn" type="submit" className={styles.buttonStyle}>提交题目</button>
          </form>
        </div>
    </div>
  );
}

export default SubmitProblem;