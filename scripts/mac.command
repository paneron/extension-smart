cd -- "$(dirname "$0")"
java -mx4g -cp "*" edu.stanford.nlp.pipeline.StanfordCoreNLPServer -quiet -annotators tokenize,ssplit,pos,lemma,parse -port 9000 -timeout 15000