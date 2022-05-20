insert into electroPT.dbo.codigo_postal (CP4,CP3,designacao_postal,id_concelho)
select CP4,CP3,designacao_postal,id_concelho from lojasBI.dbo.codigo_postal